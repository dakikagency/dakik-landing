import {
  FileUpload,
  FileUploadDropzone,
  FileUploadDropzoneIcon,
  FileUploadHelper,
  FileUploadList,
  FileUploadTitle,
} from "@/registry/react/components/file-upload";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <FileUpload accept="image/*" className="w-full" maxFiles={3}>
        <FileUploadDropzone>
          <FileUploadDropzoneIcon />
          <FileUploadTitle>
            Drag and drop images here, or click to browse
          </FileUploadTitle>
          <FileUploadHelper>PNG, JPG or WEBP — up to 3 files</FileUploadHelper>
        </FileUploadDropzone>

        <FileUploadList />
      </FileUpload>
    </div>
  );
}
