import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type FileToken = string;
export type Time = bigint;
export interface FileMetadata {
    id: FileId;
    originalFilename: string;
    createdAt: Time;
    byteSize: bigint;
    publicToken: FileToken;
    uploader: Principal;
    downloadCount: bigint;
}
export interface CountStatistics {
    fileCount: bigint;
    fileSize: bigint;
    downloadCount: bigint;
}
export type FileId = bigint;
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteFile(fileId: FileId): Promise<void>;
    downloadFile(token: FileToken): Promise<{
        originalFilename: string;
        byteData: Uint8Array;
    }>;
    finalizeUpload(fileId: FileId): Promise<void>;
    getAllFiles(): Promise<Array<FileMetadata>>;
    getCallerFiles(): Promise<Array<FileMetadata>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFileMetadata(fileId: FileId): Promise<FileMetadata>;
    getFileToken(fileId: FileId): Promise<FileToken>;
    getFileUploader(fileId: FileId): Promise<Principal>;
    getPlatformCounts(): Promise<CountStatistics>;
    getTotalDownloadCount(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initUpload(originalFilename: string): Promise<FileId>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    uploadChunk(fileId: FileId, chunk: Uint8Array): Promise<void>;
}
