import Map "mo:core/Map";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Blob "mo:core/Blob";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type FileId = Nat;
  type FileToken = Text;

  module FileState {
    public type State = { #uploading : { chunks : [Blob] }; #finalized : { content : Blob } };
  };

  type FileState = FileState.State;

  type FileMetadata = {
    id : FileId;
    uploader : Principal;
    originalFilename : Text;
    byteSize : Nat;
    createdAt : Time.Time;
    downloadCount : Nat;
    publicToken : FileToken;
  };

  module FinishedFile {
    public type FinishedFile = {
      id : FileId;
      fileContent : Blob;
      uploader : Principal;
      originalFilename : Text;
      byteSize : Nat;
      createdAt : Time.Time;
    };
  };

  type FinishedFile = FinishedFile.FinishedFile;

  public type UserProfile = {
    name : Text;
  };

  let maxChunkSize = 100_000_000;
  let maxChunksPerFile = 10_000;

  let files = Map.empty<FileId, FileMetadata>();
  let fileStates = Map.empty<FileId, FileState>();
  let tokens = Map.empty<FileToken, FileId>();
  let finishedFiles = Map.empty<FileId, FinishedFile>();
  let activeUploads = Set.empty<FileId>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var lastFileId = 0;
  var totalDownloadCounter = 0;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type CountStatistics = {
    fileCount : Nat;
    fileSize : Nat;
    downloadCount : Nat;
  };

  public query ({ caller }) func getPlatformCounts() : async CountStatistics {
    {
      fileCount = finishedFiles.size();
      fileSize = finishedFiles.values().toArray().map(func(f) { f.byteSize }).foldLeft(
        0,
        func(acc, size) { acc + size },
      );
      downloadCount = totalDownloadCounter;
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getFileMetadata(fileId : FileId) : async FileMetadata {
    switch (files.get(fileId)) {
      case (?metadata) {
        let isOwner = caller == metadata.uploader;
        let isSuperAdmin = AccessControl.isAdmin(accessControlState, caller);

        if (not isOwner and not isSuperAdmin) {
          Runtime.trap("Unauthorized: Only the uploader or super-admin can view file metadata");
        };
        metadata;
      };
      case (null) { Runtime.trap("File metadata not found!") };
    };
  };

  public query ({ caller }) func getFileUploader(fileId : FileId) : async Principal {
    switch (files.get(fileId)) {
      case (?metadata) {
        let isOwner = caller == metadata.uploader;
        let isSuperAdmin = AccessControl.isAdmin(accessControlState, caller);

        if (not isOwner and not isSuperAdmin) {
          Runtime.trap("Unauthorized: Only the uploader or super-admin can view file uploader");
        };
        metadata.uploader;
      };
      case (null) { Runtime.trap("File metadata not found!") };
    };
  };

  public query ({ caller }) func getFileToken(fileId : FileId) : async FileToken {
    switch (files.get(fileId)) {
      case (?metadata) {
        let isOwner = caller == metadata.uploader;
        let isSuperAdmin = AccessControl.isAdmin(accessControlState, caller);

        if (not isOwner and not isSuperAdmin) {
          Runtime.trap("Unauthorized: Only the uploader or super-admin can view file token");
        };
        metadata.publicToken;
      };
      case (null) { Runtime.trap("File metadata not found!") };
    };
  };

  public query ({ caller }) func getCallerFiles() : async [FileMetadata] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access their files");
    };
    files.values().filter(
      func(metadata) { metadata.uploader == caller }
    ).toArray();
  };

  public query ({ caller }) func getAllFiles() : async [FileMetadata] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only the super-admin can access all files");
    };
    files.toArray().map(func((_, metadata)) { metadata });
  };

  public query func getTotalDownloadCount() : async Nat {
    totalDownloadCounter;
  };

  public shared ({ caller }) func initUpload(originalFilename : Text) : async FileId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload files");
    };

    let newId = lastFileId + 1;
    let fileMetadata = {
      id = newId;
      uploader = caller;
      originalFilename;
      byteSize = 0;
      createdAt = Time.now();
      downloadCount = 0;
      publicToken = newId.toText();
    };

    files.add(newId, fileMetadata);
    fileStates.add(newId, #uploading { chunks = [] });
    tokens.add(fileMetadata.publicToken, newId);
    activeUploads.add(newId);
    lastFileId := newId;

    newId;
  };

  public shared ({ caller }) func uploadChunk(fileId : FileId, chunk : Blob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload files");
    };

    if (chunk.size() > maxChunkSize) {
      Runtime.trap("Chunk size exceeds maximum allowed");
    };

    if (not activeUploads.contains(fileId)) {
      Runtime.trap("Upload not active for fileId=" # fileId.toText());
    };

    switch (files.get(fileId)) {
      case (null) { Runtime.trap("File metadata not found") };
      case (?metadata) {
        if (metadata.uploader != caller) {
          Runtime.trap("Unauthorized: Only the uploader can upload chunks");
        };
      };
    };

    switch (fileStates.get(fileId)) {
      case (null) { Runtime.trap("Invalid file upload state") };
      case (?state) {
        var chunks : [Blob] = [];
        switch (state) {
          case (#uploading data) { chunks := data.chunks };
          case (#finalized _) { Runtime.trap("Cannot upload into finalized state") };
        };
        if (chunks.size() >= maxChunksPerFile) {
          Runtime.trap("Exceeds maximum chunks per file");
        };
        let newChunks = chunks.concat([chunk]);
        fileStates.add(fileId, #uploading { chunks = newChunks });
      };
    };
  };

  public shared ({ caller }) func finalizeUpload(fileId : FileId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can finalize uploads");
    };

    if (not activeUploads.contains(fileId)) {
      Runtime.trap("Upload not active for fileId=" # fileId.toText());
    };

    switch (files.get(fileId)) {
      case (null) { Runtime.trap("File metadata not found") };
      case (?metadata) {
        if (metadata.uploader != caller) {
          Runtime.trap("Unauthorized: Only the uploader can finalize upload");
        };

        switch (fileStates.get(fileId)) {
          case (null) { Runtime.trap("Invalid file upload state") };
          case (?state) {
            var chunks : [Blob] = [];
            switch (state) {
              case (#uploading data) { chunks := data.chunks };
              case (#finalized _) { Runtime.trap("Cannot upload into finalized state") };
            };
            let completeFileContent = Blob.fromArray(chunks.map(Blob.toArray).flatten());
            let byteSize = completeFileContent.size();

            finishedFiles.add(fileId, {
              id = fileId;
              fileContent = completeFileContent;
              uploader = metadata.uploader;
              originalFilename = metadata.originalFilename;
              byteSize = byteSize;
              createdAt = metadata.createdAt;
            });

            let updatedMetadata = {
              id = metadata.id;
              uploader = metadata.uploader;
              originalFilename = metadata.originalFilename;
              byteSize = byteSize;
              createdAt = metadata.createdAt;
              downloadCount = metadata.downloadCount;
              publicToken = metadata.publicToken;
            };
            files.add(fileId, updatedMetadata);

            activeUploads.remove(fileId);
            fileStates.remove(fileId);
          };
        };
      };
    };
  };

  public shared func downloadFile(token : FileToken) : async {
    originalFilename : Text;
    byteData : Blob;
  } {
    switch (tokens.get(token)) {
      case (null) { Runtime.trap("File not found for token=" # token) };
      case (?fileId) {
        switch (finishedFiles.get(fileId)) {
          case (null) {
            Runtime.trap("File not found for FileId=" # fileId.toText());
          };
          case (?fileRecord) {
            switch (files.get(fileId)) {
              case (null) { Runtime.trap("File metadata not found") };
              case (?metadata) {
                let updatedMetadata = {
                  id = metadata.id;
                  uploader = metadata.uploader;
                  originalFilename = metadata.originalFilename;
                  byteSize = metadata.byteSize;
                  createdAt = metadata.createdAt;
                  downloadCount = metadata.downloadCount + 1;
                  publicToken = metadata.publicToken;
                };
                files.add(fileId, updatedMetadata);
                totalDownloadCounter := totalDownloadCounter + 1;
              };
            };

            {
              originalFilename = fileRecord.originalFilename;
              byteData = fileRecord.fileContent;
            };
          };
        };
      };
    };
  };

  public shared ({ caller }) func deleteFile(fileId : FileId) : async () {
    switch (files.get(fileId)) {
      case (null) { Runtime.trap("File metadata not found!") };
      case (?metadata) {
        let isOwner = caller == metadata.uploader;
        let isSuperAdmin = AccessControl.isAdmin(accessControlState, caller);

        if (not isOwner and not isSuperAdmin) {
          Runtime.trap("Unauthorized: Only the uploader or super-admin can delete this file");
        };

        files.remove(fileId);
        fileStates.remove(fileId);
        tokens.remove(metadata.publicToken);
        finishedFiles.remove(fileId);
        activeUploads.remove(fileId);
      };
    };
  };
};
