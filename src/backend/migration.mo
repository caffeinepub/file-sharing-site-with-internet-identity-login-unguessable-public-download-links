import Map "mo:core/Map";
import Storage "mo:caffeineai-object-storage/Storage";
import Types "./types/file-sharing";

/// Migration from v1 (no expiryTime, no var originalFilename)
/// to v2 (expiryTime : ?Timestamp, var originalFilename).
module {
  // ── Old types (copied from .old/src/backend/types/file-sharing.mo) ─────────
  type OldFileId    = Nat;
  type OldFileToken = Text;
  type OldTimestamp = Int;

  type OldFileMetadata = {
    id            : OldFileId;
    uploader      : Principal;
    originalFilename : Text;          // immutable in old version
    byteSize      : Nat;
    createdAt     : OldTimestamp;
    var downloadCount : Nat;
    publicToken   : OldFileToken;
    blob          : Storage.ExternalBlob;
    // expiryTime was absent in the old version
  };

  type OldUserProfile = { name : Text };

  type OldActor = {
    files        : Map.Map<OldFileId,    OldFileMetadata>;
    tokenIndex   : Map.Map<OldFileToken, OldFileId>;
    userProfiles : Map.Map<Principal,    OldUserProfile>;
    nextFileId         : { var value : Nat };
    totalDownloadCount : { var value : Nat };
  };

  // ── New types (matching current types/file-sharing.mo) ──────────────────────
  type NewActor = {
    files        : Map.Map<Types.FileId,    Types.FileMetadata>;
    tokenIndex   : Map.Map<Types.FileToken, Types.FileId>;
    userProfiles : Map.Map<Principal,       Types.UserProfile>;
    nextFileId         : { var value : Nat };
    totalDownloadCount : { var value : Nat };
  };

  public func run(old : OldActor) : NewActor {
    // Migrate each FileMetadata: add expiryTime = null, make originalFilename var
    let newFiles = old.files.map<OldFileId, OldFileMetadata, Types.FileMetadata>(
      func(_id, m) {
        {
          id            = m.id;
          uploader      = m.uploader;
          var originalFilename = m.originalFilename;
          byteSize      = m.byteSize;
          createdAt     = m.createdAt;
          var downloadCount = m.downloadCount;
          publicToken   = m.publicToken;
          blob          = m.blob;
          expiryTime    = null;   // default: no expiry
        }
      }
    );
    {
      files        = newFiles;
      tokenIndex   = old.tokenIndex;
      userProfiles = old.userProfiles;
      nextFileId         = old.nextFileId;
      totalDownloadCount = old.totalDownloadCount;
    }
  };
};
