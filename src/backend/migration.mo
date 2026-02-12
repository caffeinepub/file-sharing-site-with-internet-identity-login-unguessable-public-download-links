import Map "mo:core/Map";
import Set "mo:core/Set";
import Blob "mo:core/Blob";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import AccessControl "authorization/access-control";

module {
  public type FileId = Nat;
  public type FileToken = Text;

  public type FileState = { #uploading : { chunks : [Blob] }; #finalized : { content : Blob } };

  public type FileMetadata = {
    id : FileId;
    uploader : Principal;
    originalFilename : Text;
    byteSize : Nat;
    createdAt : Time.Time;
    downloadCount : Nat;
    publicToken : FileToken;
  };

  public type FinishedFile = {
    id : FileId;
    fileContent : Blob;
    uploader : Principal;
    originalFilename : Text;
    byteSize : Nat;
    createdAt : Time.Time;
  };

  public type UserProfile = {
    name : Text;
  };

  public type Actor = {
    files : Map.Map<FileId, FileMetadata>;
    fileStates : Map.Map<FileId, FileState>;
    tokens : Map.Map<FileToken, FileId>;
    finishedFiles : Map.Map<FileId, FinishedFile>;
    activeUploads : Set.Set<FileId>;
    userProfiles : Map.Map<Principal, UserProfile>;
    lastFileId : Nat;
    totalDownloadCounter : Nat;
    accessControlState : AccessControl.AccessControlState;
  };

  public func run(old : Actor) : Actor {
    let maxChunkSize = 100_000_000;
    let maxChunksPerFile = 10_000;

    let newFiles = old.files;
    let newFileStates = old.fileStates;
    let newTokens = Map.empty<FileToken, FileId>();
    let newFinishedFiles = old.finishedFiles;
    let newActiveUploads = old.activeUploads;
    let newUserProfiles = old.userProfiles;
    let newLastFileId = old.lastFileId;
    let newTotalDownloadCounter = old.totalDownloadCounter;
    let newAccessControlState = old.accessControlState;

    {
      files = newFiles;
      fileStates = newFileStates;
      tokens = newTokens;
      finishedFiles = newFinishedFiles;
      activeUploads = newActiveUploads;
      userProfiles = newUserProfiles;
      lastFileId = newLastFileId;
      totalDownloadCounter = newTotalDownloadCounter;
      accessControlState = newAccessControlState;
    };
  };
};
