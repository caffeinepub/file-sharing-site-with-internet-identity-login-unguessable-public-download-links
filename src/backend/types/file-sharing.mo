import Storage "mo:caffeineai-object-storage/Storage";
import Common "common";

module {
  public type FileId = Common.FileId;
  public type FileToken = Common.FileToken;
  public type Timestamp = Common.Timestamp;

  /// Public-facing file info returned in list queries (caller's own files)
  public type FileInfo = {
    id : FileId;
    name : Text;
    size : Nat;
    uploadTime : Timestamp;
    downloadCount : Nat;
    token : FileToken;
    expiryTime : ?Timestamp;
  };

  /// Admin-facing file info — includes uploader principal
  public type FileInfoAdmin = {
    id : FileId;
    name : Text;
    size : Nat;
    uploadTime : Timestamp;
    downloadCount : Nat;
    token : FileToken;
    uploader : Principal;
    expiryTime : ?Timestamp;
  };

  /// Platform-level aggregate statistics
  public type PlatformCounts = {
    totalFiles : Nat;
    totalBytes : Nat;
    totalDownloads : Nat;
  };

  /// Internal file metadata stored on-canister
  public type FileMetadata = {
    id : FileId;
    uploader : Principal;
    var originalFilename : Text;
    byteSize : Nat;
    createdAt : Timestamp;
    var downloadCount : Nat;
    publicToken : FileToken;
    blob : Storage.ExternalBlob;
    expiryTime : ?Timestamp;
  };

  /// User profile
  public type UserProfile = {
    name : Text;
  };
};
