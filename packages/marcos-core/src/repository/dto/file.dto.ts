export type FileDto = {
	orderUuid: string;
	fileUuid: string;
	type: string;
	key: string;
	thumbnailKey?: string;
	optimizedKey?: string;
	originalFilename: string;
};
