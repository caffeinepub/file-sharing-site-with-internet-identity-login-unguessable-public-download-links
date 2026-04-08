import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Timestamp = bigint;
export type FileToken = string;
export interface FileInfoAdmin {
    id: FileId;
    token: FileToken;
    name: string;
    expiryTime?: Timestamp;
    size: bigint;
    uploader: Principal;
    downloadCount: bigint;
    uploadTime: Timestamp;
}
export interface PlatformCounts {
    totalFiles: bigint;
    totalBytes: bigint;
    totalDownloads: bigint;
}
export interface FileInfo {
    id: FileId;
    token: FileToken;
    name: string;
    expiryTime?: Timestamp;
    size: bigint;
    downloadCount: bigint;
    uploadTime: Timestamp;
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
    downloadFile(token: FileToken): Promise<ExternalBlob>;
    getAllFiles(): Promise<Array<FileInfoAdmin>>;
    getCallerFiles(): Promise<Array<FileInfo>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPlatformCounts(): Promise<PlatformCounts>;
    isCallerAdmin(): Promise<boolean>;
    renameFile(fileId: FileId, newName: string): Promise<void>;
    saveCallerUserProfile(name: string): Promise<void>;
    uploadFile(name: string, size: bigint, blob: ExternalBlob, expiryTime: Timestamp | null): Promise<FileInfo>;
}
