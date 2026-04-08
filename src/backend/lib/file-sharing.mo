import Map "mo:core/Map";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Storage "mo:caffeineai-object-storage/Storage";
import Types "../types/file-sharing";

module {
  public type FileId = Types.FileId;
  public type FileToken = Types.FileToken;
  public type FileMetadata = Types.FileMetadata;
  public type FileInfo = Types.FileInfo;
  public type FileInfoAdmin = Types.FileInfoAdmin;
  public type PlatformCounts = Types.PlatformCounts;
  public type Timestamp = Types.Timestamp;

  /// Alphanumeric charset for token generation (62 chars: 0-9, A-Z, a-z)
  let CHARSET : [Char] = [
    '0','1','2','3','4','5','6','7','8','9',
    'A','B','C','D','E','F','G','H','I','J','K','L','M',
    'N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
    'a','b','c','d','e','f','g','h','i','j','k','l','m',
    'n','o','p','q','r','s','t','u','v','w','x','y','z',
  ];

  let TOKEN_LENGTH : Nat = 20;
  let CHARSET_SIZE : Nat = 62;

  // Large prime-based multiplier and addend for the LCG
  let LCG_MUL : Nat = 6364136223846793005;
  let LCG_ADD : Nat = 1442695040888963407;
  let LCG_MOD : Nat = 18446744073709551615; // 2^64 - 1

  /// Generate a non-guessable 20-character alphanumeric token using an LCG.
  public func generateToken(seed : Nat) : FileToken {
    var entropy = seed % LCG_MOD;
    let chars = List.empty<Char>();
    var i = 0;
    while (i < TOKEN_LENGTH) {
      entropy := (entropy * LCG_MUL + LCG_ADD) % LCG_MOD;
      let idx = entropy % CHARSET_SIZE;
      chars.add(CHARSET[idx]);
      i += 1;
    };
    Text.fromIter(chars.values())
  };

  /// Build entropy seed from time (nanoseconds), fileId, and caller principal bytes.
  public func buildSeed(timeNow : Int, fileId : Nat, caller : Principal) : Nat {
    let t : Nat = Int.abs(timeNow);
    let principalBlob = caller.toBlob();
    var pHash : Nat = 0;
    for (b in principalBlob.vals()) {
      pHash := (pHash * 31 + b.toNat()) % LCG_MOD;
    };
    (t + fileId + pHash) % LCG_MOD
  };

  /// Create and store a new file record. Returns public FileInfo.
  public func createFile(
    files : Map.Map<FileId, FileMetadata>,
    tokenIndex : Map.Map<FileToken, FileId>,
    caller : Principal,
    filename : Text,
    size : Nat,
    blob : Storage.ExternalBlob,
    nextFileId : Nat,
    tokenSeed : Nat,
    expiryTime : ?Timestamp,
  ) : FileInfo {
    let token = generateToken(tokenSeed);
    let meta : FileMetadata = {
      id = nextFileId;
      uploader = caller;
      var originalFilename = filename;
      byteSize = size;
      createdAt = Time.now();
      var downloadCount = 0;
      publicToken = token;
      blob;
      expiryTime;
    };
    files.add(nextFileId, meta);
    tokenIndex.add(token, nextFileId);
    toFileInfo(meta)
  };

  /// Return all files belonging to the caller as FileInfo.
  public func getCallerFiles(
    files : Map.Map<FileId, FileMetadata>,
    caller : Principal,
  ) : [FileInfo] {
    let result = List.empty<FileInfo>();
    for ((_, meta) in files.entries()) {
      if (Principal.equal(meta.uploader, caller)) {
        result.add(toFileInfo(meta));
      };
    };
    result.toArray()
  };

  /// Return all files (admin view) as FileInfoAdmin.
  public func getAllFiles(
    files : Map.Map<FileId, FileMetadata>,
  ) : [FileInfoAdmin] {
    let result = List.empty<FileInfoAdmin>();
    for ((_, meta) in files.entries()) {
      result.add(toFileInfoAdmin(meta));
    };
    result.toArray()
  };

  /// Look up a file by its download token. Returns metadata or null.
  public func getFileByToken(
    files : Map.Map<FileId, FileMetadata>,
    tokenIndex : Map.Map<FileToken, FileId>,
    token : FileToken,
  ) : ?FileMetadata {
    switch (tokenIndex.get(token)) {
      case (?fileId) files.get(fileId);
      case null null;
    }
  };

  /// Increment per-file download count.
  public func incrementDownload(
    files : Map.Map<FileId, FileMetadata>,
    fileId : FileId,
  ) : () {
    switch (files.get(fileId)) {
      case (?meta) {
        meta.downloadCount += 1;
      };
      case null Runtime.trap("File not found");
    };
  };

  /// Delete a file: removes metadata and token index entry.
  /// The ExternalBlob reference is dropped; object-storage GC handles cleanup.
  public func deleteFile(
    files : Map.Map<FileId, FileMetadata>,
    tokenIndex : Map.Map<FileToken, FileId>,
    fileId : FileId,
  ) : () {
    switch (files.get(fileId)) {
      case (?meta) {
        tokenIndex.remove(meta.publicToken);
        files.remove(fileId);
      };
      case null Runtime.trap("File not found");
    };
  };

  /// Rename a file — updates originalFilename in-place.
  public func renameFile(
    files : Map.Map<FileId, FileMetadata>,
    fileId : FileId,
    newName : Text,
  ) : () {
    switch (files.get(fileId)) {
      case (?meta) {
        meta.originalFilename := newName;
      };
      case null Runtime.trap("File not found");
    };
  };

  /// Compute aggregate platform statistics.
  public func getPlatformCounts(
    files : Map.Map<FileId, FileMetadata>,
    totalDownloads : Nat,
  ) : PlatformCounts {
    var totalFiles : Nat = 0;
    var totalBytes : Nat = 0;
    for ((_, meta) in files.entries()) {
      totalFiles += 1;
      totalBytes += meta.byteSize;
    };
    {
      totalFiles;
      totalBytes;
      totalDownloads;
    }
  };

  /// Convert internal FileMetadata to public FileInfo.
  public func toFileInfo(meta : FileMetadata) : FileInfo {
    {
      id = meta.id;
      name = meta.originalFilename;
      size = meta.byteSize;
      uploadTime = meta.createdAt;
      downloadCount = meta.downloadCount;
      token = meta.publicToken;
      expiryTime = meta.expiryTime;
    }
  };

  /// Convert internal FileMetadata to admin FileInfoAdmin.
  public func toFileInfoAdmin(meta : FileMetadata) : FileInfoAdmin {
    {
      id = meta.id;
      name = meta.originalFilename;
      size = meta.byteSize;
      uploadTime = meta.createdAt;
      downloadCount = meta.downloadCount;
      token = meta.publicToken;
      uploader = meta.uploader;
      expiryTime = meta.expiryTime;
    }
  };
};
