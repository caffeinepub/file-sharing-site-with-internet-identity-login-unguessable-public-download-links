import type { backendInterface, ExternalBlob, FileInfo } from "../backend";

const mockFiles: FileInfo[] = [
  {
    id: BigInt(1),
    token: "aB3xK9mPqR7sT2vW5z",
    name: "project-report-2026.pdf",
    size: BigInt(2456789),
    downloadCount: BigInt(14),
    uploadTime: BigInt(Date.now() * 1000000 - 86400000000000),
  },
  {
    id: BigInt(2),
    token: "cD5yL1nQrS8uV4wXjE",
    name: "design-assets.zip",
    size: BigInt(15678432),
    downloadCount: BigInt(3),
    uploadTime: BigInt(Date.now() * 1000000 - 3600000000000),
  },
];

const mockAdminFiles = mockFiles.map((f) => ({
  ...f,
  uploader: { toText: () => "aaaaa-bbbbb-ccccc-ddddd-eeeee-fffff-ggggg-h" } as any,
}));

export const mockBackend: backendInterface = {
  _immutableObjectStorageBlobsAreLive: async (_hashes) => [],
  _immutableObjectStorageBlobsToDelete: async () => [],
  _immutableObjectStorageConfirmBlobDeletion: async (_blobs) => undefined,
  _immutableObjectStorageCreateCertificate: async (_blobHash) => ({
    method: "upload",
    blob_hash: _blobHash,
  }),
  _immutableObjectStorageRefillCashier: async (_info) => ({
    success: true,
    topped_up_amount: undefined,
  }),
  _immutableObjectStorageUpdateGatewayPrincipals: async () => undefined,
  _initializeAccessControl: async () => undefined,
  assignCallerUserRole: async () => undefined,
  deleteFile: async () => undefined,
  downloadFile: async (_token) => {
    throw new Error("Download not available in mock mode");
  },
  getAllFiles: async () => mockAdminFiles,
  getCallerFiles: async () => mockFiles,
  getCallerUserProfile: async () => ({ name: "Alice Demo" }),
  getCallerUserRole: async () => "admin" as any,
  getPlatformCounts: async () => ({
    totalFiles: BigInt(2),
    totalBytes: BigInt(18135221),
    totalDownloads: BigInt(17),
  }),
  isCallerAdmin: async () => true,
  renameFile: async (_fileId, _newName) => undefined,
  saveCallerUserProfile: async (_name) => undefined,
  uploadFile: async (_name, _size, _blob, _expiryTime) => mockFiles[0],
};
