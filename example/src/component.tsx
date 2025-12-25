import type { ChangeEvent } from "react";
import { useUpload } from "upload-with-progress";
import { generatePresignedUrlForPut } from "./s3";

type MetaData = {
  key: string;
};

export const UploadComponent = () => {
  const { upload, progress, isUploading, error, abort } = useUpload<MetaData>();

  const changeHandler = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return alert("Please select a file");
    }

    const res = await upload(file, async () => {
      const bucketName = "my-bucket";
      const key = file.name;
      const contentType = file.type;

      console.log(bucketName, key, contentType);

      const presignedUrl = await generatePresignedUrlForPut(
        bucketName,
        key,
        contentType
      );

      return {
        presignedUrl,
        meta: { key },
      };
    });

    console.log(res);
  };

  return (
    <>
      <input type="file" onChange={changeHandler} />

      {isUploading && <p>Uploading… {progress}%</p>}

      {isUploading && <button onClick={abort}>cancel</button>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </>
  );
};
