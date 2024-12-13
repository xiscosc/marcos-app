export enum FileType {
	VIDEO = 'video',
	PHOTO = 'photo',
	OTHER = 'other'
}

export type File = {
	orderId: string;
	id: string;
	originalFilename: string;
	downloadUrl?: string;
	thumbnailDownloadUrl?: string;
	uploadUrl?: string;
	type: FileType;
};
