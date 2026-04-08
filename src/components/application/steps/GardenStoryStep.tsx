"use client";
import Image from "next/image";
import { Button } from "@mui/material";
import TextField from "@mui/material/TextField";
import Link from "next/link";
import { useApplicationForm } from "@/src/components/application/ApplicationFormProvider";
import useReadQuestion from "@/src/hooks/questions/useReadQuestion";
import useUploadCampaignImage from "@/src/hooks/campaign-image-records/useUploadCampaignImage";
import { notFound } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { useState, useEffect } from "react";

export default function GardenStoryStep() {
  const form = useApplicationForm();
  const { data: question1, isLoading: isLoadingQuestion1 } = useReadQuestion(1);
  const { data: question2, isLoading: isLoadingQuestion2 } = useReadQuestion(2);
  const { data: question3, isLoading: isLoadingQuestion3 } = useReadQuestion(3);
  const { data: question4, isLoading: isLoadingQuestion4 } = useReadQuestion(4);

  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".png", ".gif", ".jpeg", ".jpg", ".svg"],
    },
    multiple: false,
    maxFiles: 1,
    onDrop: (file) => {
      console.log(file);
    },
    onDropAccepted: (acceptedFiles) => {
      setUploaded(true);
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        ),
      );
    },
    maxSize: 3000000,
  });

  const [uploaded, setUploaded] = useState(false);
  const [files, setFiles] = useState<Array<File & { preview: string }>>([]);
  const fileNames = acceptedFiles.map((file) => (
    <li key={file.path}>{file.path}</li>
  ));

  const imagePreviews = files.map((file) => (
    <div key={file.name}>
      <div className="w-[650px] h-[358px] overflow-hidden border border-gray-300">
        <img
          src={file.preview}
          alt={file.name}
          className="w-full h-full object-cover"
          // Revoke data uri after image is loaded
          onLoad={() => {
            URL.revokeObjectURL(file.preview);
          }}
        />
      </div>
    </div>
  ));

  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [files]);

  const isLoading =
    isLoadingQuestion1 ||
    isLoadingQuestion2 ||
    isLoadingQuestion3 ||
    isLoadingQuestion4;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!question1 || !question2 || !question3 || !question4) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 w-[700px] m-15">
      {/* Garden Story */}
      <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">
        <h2 className="text-[20px] font-medium">
          Garden Story <span className="text-orange-500">*</span>
        </h2>

        <p className="text-sm text-gray-600">2-3 sentences each</p>

        <form.Field name="storyLocationAndAudience">
          {(field) => (
            <TextField
              variant="standard"
              label={question1.question}
              fullWidth
              name="storyLocationAndAudience"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              onInput={(e) =>
                field.handleChange((e.target as HTMLInputElement).value)
              }
            />
          )}
        </form.Field>

        <form.Field name="storyChallenge">
          {(field) => (
            <TextField
              variant="standard"
              label={question2.question}
              fullWidth
              name="storyChallenge"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              onInput={(e) =>
                field.handleChange((e.target as HTMLInputElement).value)
              }
            />
          )}
        </form.Field>

        <form.Field name="storySeasonActivity">
          {(field) => (
            <TextField
              variant="standard"
              label={question3.question}
              fullWidth
              name="storySeasonActivity"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              onInput={(e) =>
                field.handleChange((e.target as HTMLInputElement).value)
              }
            />
          )}
        </form.Field>

        <form.Field name="storyCampaignImpact">
          {(field) => (
            <TextField
              variant="standard"
              label={question4.question}
              fullWidth
              name="storyCampaignImpact"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              onInput={(e) =>
                field.handleChange((e.target as HTMLInputElement).value)
              }
            />
          )}
        </form.Field>
      </div>

      {/* Main Photo */}
      <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">
        <h2 className="text-[20px] font-medium">
          Main Photo <span className="text-orange-500">*</span>
        </h2>

        <p className="text-sm text-gray-600">
          Upload one clear, high-quality photo that best represents your
          project. This photo will appear at the top of your campaign page.
        </p>
        {uploaded ? (
          imagePreviews
        ) : (
          <div {...getRootProps({ className: "dropzone" })}>
            <input {...getInputProps()} />
            <div className="border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center py-10 gap-3 text-center">
              {/* Upload Icon */}
              <Image
                src="/icons/upload-icon.svg"
                alt="Upload icon"
                width={16}
                height={20}
              />

              <p className="text-sm">
                <span className="text-blue-600 cursor-pointer hover:underline">
                  Link
                </span>{" "}
                or drag and drop
              </p>

              <p className="text-xs text-gray-500">
                SVG, PNG, JPG or GIF (max. 3MB)
              </p>
            </div>
          </div>
        )}

        <ul>{fileNames}</ul>
      </div>

      {/* Supporting Photos */}
      <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">
        <h2 className="text-[20px] font-medium">Supporting Photos</h2>

        <p className="text-sm text-gray-600">
          You may upload up to five additional photos that help tell your
          garden’s story.
          <br />
          *Please choose real, authentic photos of your project and do not
          upload logos, flyers, graphics, or AI-generated images.
        </p>

        <div className="border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center py-10 gap-3 text-center">
          {/* Upload Icon */}
          <Image
            src="/icons/upload-icon.svg"
            alt="Upload icon"
            width={16}
            height={20}
          />

          <p className="text-sm">
            <span className="text-blue-600 cursor-pointer hover:underline">
              Link
            </span>{" "}
            or drag and drop
          </p>

          <p className="text-xs text-gray-500">
            SVG, PNG, JPG or GIF (max. 3MB)
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-2">
        <Button
          component={Link}
          href="/apply/garden"
          variant="outlined"
          size="medium"
        >
          Previous Step
        </Button>

        <Button
          component={Link}
          href="/apply/contact"
          variant="contained"
          size="medium"
        >
          Next Step
        </Button>
      </div>
    </div>
  );
}
