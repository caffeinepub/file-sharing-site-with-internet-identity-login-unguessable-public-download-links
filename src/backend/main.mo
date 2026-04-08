import Map "mo:core/Map";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import Types "types/file-sharing";
import FileSharingApi "mixins/file-sharing-api";
import Migration "migration";


(with migration = Migration.run)
actor {
  // ── Authorization state (managed by MixinAuthorization) ─────────────────────
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ── Object storage infrastructure ────────────────────────────────────────────
  include MixinObjectStorage();

  // ── File-sharing domain state ─────────────────────────────────────────────────
  let files        = Map.empty<Types.FileId,    Types.FileMetadata>();
  let tokenIndex   = Map.empty<Types.FileToken, Types.FileId>();
  let userProfiles = Map.empty<Principal,       Types.UserProfile>();

  var _nextFileId         : Nat = 0;
  var _totalDownloadCount : Nat = 0;

  // Box counters as mutable records so mixins can mutate them
  let nextFileId         = { var value = _nextFileId };
  let totalDownloadCount = { var value = _totalDownloadCount };

  // ── File-sharing public API ───────────────────────────────────────────────────
  include FileSharingApi(
    accessControlState,
    files,
    tokenIndex,
    userProfiles,
    nextFileId,
    totalDownloadCount,
  );
};
