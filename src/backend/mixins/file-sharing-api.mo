import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import Storage "mo:caffeineai-object-storage/Storage";
import Types "../types/file-sharing";
import FileLib "../lib/file-sharing";

/// Public API mixin for the file-sharing domain.
/// Receives injected state: accessControlState, files, tokenIndex,
/// counters, and userProfiles.
mixin (
  accessControlState : AccessControl.AccessControlState,
  files : Map.Map<Types.FileId, Types.FileMetadata>,
  tokenIndex : Map.Map<Types.FileToken, Types.FileId>,
  userProfiles : Map.Map<Principal, Types.UserProfile>,
  nextFileId : { var value : Nat },
  totalDownloadCount : { var value : Nat },
) {

  // ── Statistics ──────────────────────────────────────────────────────────────

  public query func getPlatformCounts() : async Types.PlatformCounts {
    FileLib.getPlatformCounts(files, totalDownloadCount.value)
  };

  // ── User Profile ────────────────────────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?Types.UserProfile {
    userProfiles.get(caller)
  };

  /// Save the caller's profile. The first caller to save a profile becomes super-admin.
  public shared ({ caller }) func saveCallerUserProfile(name : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous principals cannot save a profile");
    };
    let isFirstUser = userProfiles.size() == 0;
    userProfiles.add(caller, { name });
    if (isFirstUser) {
      // Elevate the first registered user to admin
      AccessControl.assignRole(accessControlState, caller, caller, #admin);
    };
  };

  // ── File Queries ─────────────────────────────────────────────────────────────

  public query ({ caller }) func getCallerFiles() : async [Types.FileInfo] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: must be logged in");
    };
    FileLib.getCallerFiles(files, caller)
  };

  public query ({ caller }) func getAllFiles() : async [Types.FileInfoAdmin] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    FileLib.getAllFiles(files)
  };

  // ── Upload ───────────────────────────────────────────────────────────────────

  /// Upload a file. The caller passes the ExternalBlob (already stored by the
  /// object-storage infrastructure on the frontend) along with metadata.
  /// Optional expiryTime (nanoseconds since epoch) sets when the link expires.
  /// Returns the stable FileId and the random download token.
  public shared ({ caller }) func uploadFile(
    name : Text,
    size : Nat,
    blob : Storage.ExternalBlob,
    expiryTime : ?Types.Timestamp,
  ) : async Types.FileInfo {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: must be logged in");
    };
    let fileId = nextFileId.value;
    let seed = FileLib.buildSeed(Time.now(), fileId, caller);
    let info = FileLib.createFile(files, tokenIndex, caller, name, size, blob, fileId, seed, expiryTime);
    nextFileId.value += 1;
    info
  };

  // ── Download ─────────────────────────────────────────────────────────────────

  /// Public download endpoint — any caller can use a valid token.
  /// Returns an error if the token is invalid or the file has expired.
  /// Increments per-file and global download counts.
  public shared func downloadFile(token : Types.FileToken) : async Storage.ExternalBlob {
    let meta = switch (FileLib.getFileByToken(files, tokenIndex, token)) {
      case (?m) m;
      case null Runtime.trap("Invalid download token");
    };
    switch (meta.expiryTime) {
      case (?expiry) {
        if (Time.now() > expiry) {
          Runtime.trap("Download link has expired");
        };
      };
      case null {};
    };
    FileLib.incrementDownload(files, meta.id);
    totalDownloadCount.value += 1;
    meta.blob
  };

  // ── Delete ────────────────────────────────────────────────────────────────────

  /// Delete a file — only the uploader or admin may call this.
  /// Dropping the ExternalBlob reference allows the object-storage GC to clean up.
  public shared ({ caller }) func deleteFile(fileId : Types.FileId) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: must be logged in");
    };
    let meta = switch (files.get(fileId)) {
      case (?m) m;
      case null Runtime.trap("File not found");
    };
    let isOwner = Principal.equal(meta.uploader, caller);
    let isAdminCaller = AccessControl.isAdmin(accessControlState, caller);
    if (not isOwner and not isAdminCaller) {
      Runtime.trap("Unauthorized: only the file owner or an admin can delete this file");
    };
    FileLib.deleteFile(files, tokenIndex, fileId);
  };

  // ── Rename ────────────────────────────────────────────────────────────────────

  /// Rename a file — only the uploader or admin may call this.
  public shared ({ caller }) func renameFile(fileId : Types.FileId, newName : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: must be logged in");
    };
    let meta = switch (files.get(fileId)) {
      case (?m) m;
      case null Runtime.trap("File not found");
    };
    let isOwner = Principal.equal(meta.uploader, caller);
    let isAdminCaller = AccessControl.isAdmin(accessControlState, caller);
    if (not isOwner and not isAdminCaller) {
      Runtime.trap("Unauthorized: only the file owner or an admin can rename this file");
    };
    FileLib.renameFile(files, fileId, newName);
  };

};
