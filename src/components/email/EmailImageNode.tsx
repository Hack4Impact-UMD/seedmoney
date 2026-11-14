"use client";

import { useEffect, useRef, useState } from "react";
import Image from "@tiptap/extension-image";
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react";
import {
  MAX_EMAIL_IMAGE_BYTES,
  uploadEmailImage,
} from "@/src/actions/db/email-images";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/gif"];

// Sizes of images uploaded this session, so the caption doesn't have to ask
const knownSizes = new Map<string, number>();

export function rememberEmailImageSize(src: string, bytes: number) {
  knownSizes.set(src, bytes);
}

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

// Uploaded files are stored as "<uuid>-<name>"; show just the name
function fileNameFromUrl(src: string) {
  try {
    const last = decodeURIComponent(new URL(src).pathname.split("/").pop() ?? "");
    return last.replace(/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}-/i, "");
  } catch {
    return "";
  }
}

// The image in the Text tab, with its file name, size and Replace / Remove
function EmailImageView({ node, updateAttributes, deleteNode, editor }: NodeViewProps) {
  const src = String(node.attrs.src ?? "");
  const alt = String(node.attrs.alt ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  const [size, setSize] = useState<{ src: string; bytes: number } | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);
  const [error, setError] = useState("");

  // Images from an earlier session: ask the server how big the file is
  useEffect(() => {
    if (!src || knownSizes.has(src)) return;
    const controller = new AbortController();
    fetch(src, { method: "HEAD", signal: controller.signal })
      .then((response) => {
        const bytes = Number(response.headers.get("content-length"));
        if (response.ok && bytes > 0) {
          knownSizes.set(src, bytes);
          setSize({ src, bytes });
        }
      })
      .catch(() => { /* The size is optional. */ });
    return () => controller.abort();
  }, [src]);

  const bytes = knownSizes.get(src) ?? (size?.src === src ? size.bytes : null);
  const name = alt || fileNameFromUrl(src) || "Image";

  const replaceImage = async (file: File | undefined) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type) || file.size > MAX_EMAIL_IMAGE_BYTES) {
      setError("Only PNG, JPG or GIF images under 3MB are allowed.");
      return;
    }
    setError("");
    setIsReplacing(true);
    try {
      const url = await uploadEmailImage(file);
      rememberEmailImageSize(url, file.size);
      updateAttributes({ src: url, alt: file.name });
    } catch (failure) {
      console.error(failure);
      setError(`Couldn't upload ${file.name}. Please try again.`);
    } finally {
      setIsReplacing(false);
    }
  };

  return (
    <NodeViewWrapper className="email-image">
      {/* eslint-disable-next-line @next/next/no-img-element -- email content, not a page asset */}
      <img src={src} alt={alt} data-drag-handle />

      {editor.isEditable && (
        <div contentEditable={false} className="email-image-caption">
          <span className="email-image-name">{name}</span>
          {bytes !== null && <span>· {formatSize(bytes)}</span>}
          <button
            type="button"
            disabled={isReplacing}
            onClick={() => inputRef.current?.click()}
          >
            {isReplacing ? "Uploading..." : "Replace"}
          </button>
          <button type="button" disabled={isReplacing} onClick={deleteNode}>
            Remove
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            hidden
            onChange={(event) => {
              void replaceImage(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          {error && <span role="alert" className="email-image-error">{error}</span>}
        </div>
      )}
    </NodeViewWrapper>
  );
}

// Same stored HTML as the stock image; only how the Text tab draws it changes
export const EmailImage = Image.extend({
  addNodeView() {
    return ReactNodeViewRenderer(EmailImageView);
  },
});
