"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@mui/material";

export default function ReviewSubmitPage() {
  return (
    <div className="w-[700px] flex flex-col gap-6 pb-20 m-15">
      {/* ---------------- CAMPAIGN INFORMATION ---------------- */}

      <h2 className="text-xl font-semibold">Campaign Information</h2>

      {/* Campaign Title */}

      <div className="bg-white border border-black/10 rounded-[16px] p-6 flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-medium">
            Campaign Title <span className="text-orange-500">*</span>
          </h3>

          <p className="text-sm text-gray-600 mt-1">
            The name of your garden, e.g. Fairview Community Garden,
            Pleasantville Primary School Garden, Holy Jalapeno Church Garden.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Campaign Title</label>
          <p>Fully Belly Community Garden</p>
          <div className="border-b border-gray-300"></div>
        </div>
      </div>

      {/* Project Details */}

      <div className="bg-white border border-black/10 rounded-[16px] p-6 flex flex-col gap-6">
        <h3 className="text-lg font-medium">
          Project Details & Impact <span className="text-orange-500">*</span>
        </h3>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">
            About how many people will benefit from this garden this year?
          </label>

          <p>250</p>
          <div className="border-b border-gray-300"></div>
        </div>

        {/* RADIO UI */}

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-500">
            Is this a new or existing garden?
          </label>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border rounded-full border-gray-400"></div>
              <span>New garden</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-blue-600 flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
              <span>Existing garden</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">
            Approximate garden size or scope
          </label>

          <p>2000</p>
          <div className="border-b border-gray-300"></div>
        </div>
      </div>

      {/* Fundraising Goal */}

      <div className="bg-white border border-black/10 rounded-[16px] p-6 flex flex-col gap-4">
        <h3 className="text-lg font-medium">
          Fundraising Goal <span className="text-orange-500">*</span>
        </h3>

        <p className="text-sm text-gray-600">
          Most SeedMoney projects set goals between $500 and $5,000
        </p>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">
            Fundraising Goal (USD)
          </label>
          <p>600</p>
          <div className="border-b border-gray-300"></div>
        </div>
      </div>

      {/* ---------------- GARDEN INFORMATION ---------------- */}

      <h2 className="text-xl font-semibold">Garden Information</h2>

      {/* Error Banner */}

      <div className="flex justify-between items-center bg-[#FDECEA] text-[#5F2120] px-4 py-3 rounded-md text-sm">
        <div className="flex items-center gap-2">
          <Image src="/icons/error.svg" width={18} height={18} alt="error" />

          <span>Please complete garden location</span>
        </div>

        <Link
          href="/apply/garden"
          className="flex items-center gap-2 text-[#D32F2F] font-medium"
        >
          <Image src="/icons/pencil.svg" width={16} height={16} alt="edit" />
          EDIT
        </Link>
      </div>

      {/* Garden Location */}

      <div className="bg-white border border-black/10 rounded-[16px] p-6 flex flex-col gap-6">
        <h3 className="text-lg font-medium">
          Garden Location <span className="text-orange-500">*</span>
        </h3>

        {/* Missing City */}

        <div className="flex flex-col gap-1">
          <label className="text-lg text-gray-400">City</label>
          <div className="border-b border-[#D32F2F] mt-2"></div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">State / Province*</label>
          <p>Maine</p>
          <div className="border-b border-gray-300"></div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Country</label>
          <p>United States</p>
          <div className="border-b border-gray-300"></div>
        </div>
      </div>

      {/* Category */}

      <div className="bg-white border border-black/10 rounded-[16px] p-6 flex flex-col gap-2">
        <h3 className="text-lg font-medium">
          Primary Project Category <span className="text-orange-500">*</span>
        </h3>

        <p>Community Garden</p>
      </div>

      {/* Beneficiaries */}

      <div className="bg-white border border-black/10 rounded-[16px] p-6 flex flex-col gap-2">
        <h3 className="text-lg font-medium">
          Beneficiary Populations Served{" "}
          <span className="text-orange-500">*</span>
        </h3>

        <p>Food insecure people</p>
      </div>

      {/* ---------------- GARDEN STORY ---------------- */}

      <h2 className="text-xl font-semibold">Garden Story</h2>

      <div className="flex justify-between items-center bg-[#FDECEA] text-[#5F2120] px-4 py-3 rounded-md text-sm">
        <div className="flex items-center gap-2">
          <Image src="/icons/error.svg" width={18} height={18} alt="error" />

          <span>Please complete garden story and main photo</span>
        </div>

        <Link
          href="/apply/story"
          className="flex items-center gap-2 text-[#D32F2F]"
        >
          <Image src="/icons/pencil.svg" width={16} height={16} alt="edit" />
          EDIT
        </Link>
      </div>

      {/* Garden Story Card */}

      <div className="bg-white border border-black/10 rounded-[16px] p-6 flex flex-col gap-6">
        <h3 className="text-lg font-medium">
          Garden Story <span className="text-orange-500">*</span>
        </h3>

        <p className="text-sm">2–3 sentences each</p>

        {/* Q1 */}

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">
            Where is your garden, and who does it serve?
          </label>

          <p>
            The Full Belly Community Garden in Scarborough, Maine, provides over
            300 pounds of organic produce annually to local food-insecure
            families and seniors. Beyond its harvest, it serves as an
            educational hub for at-risk youth and neighbors through nature
            exploration and hands-on gardening workshops.
          </p>

          <div className="border-b border-gray-300"></div>
        </div>

        {/* Q2 */}

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">
            What challenge does your garden help address, and why does it matter
            locally?
          </label>

          <p>
            The Full Belly Community Garden addresses the challenge of food
            insecurity, specifically the difficulty many local families and
            seniors face in accessing fresh, affordable organic produce.
          </p>

          <div className="border-b border-gray-300"></div>
        </div>

        {/* Q3 */}

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">
            What happens in the garden during the growing season?
          </label>

          <p>
            During the growing season, it serves as a &quot;vibrant oasis&quot;
            where volunteers host monthly workshops to teach gardening skills
            and provide a safe space for at-risk youth to explore nature.
          </p>

          <div className="border-b border-gray-300"></div>
        </div>

        {/* Q4 */}

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">
            What will this year&apos;s SeedMoney campaign make possible?
          </label>

          <p>
            These contributions allow the garden to continue its mission of
            providing over 300 pounds of organic food to local food-insecure
            families and seniors at the Elm Street Senior Center.
          </p>

          <div className="border-b border-gray-300"></div>
        </div>
      </div>

      {/* ---------------- MAIN PHOTO ---------------- */}

      <div className="bg-white border border-black/10 rounded-[16px] p-6 flex flex-col gap-4">
        <h3 className="text-lg font-medium">
          Main Photo <span className="text-orange-500">*</span>
        </h3>

        <p className="text-sm text-gray-600">
          Upload one clear, high-quality photo that best represents your
          project. This photo will appear at the top of your campaign page.
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[#D32F2F]">
            <div
              style={{
                filter:
                  "invert(27%) sepia(80%) saturate(800%) hue-rotate(330deg) brightness(85%)",
              }}
            >
              <Image
                src="/icons/upload-icon.svg"
                width={20}
                height={20}
                alt="error"
              />
            </div>

            <div>
              <p>Upload failed.</p>
              <p className="text-sm">File too large • Failed</p>
            </div>
          </div>

          <Image
            src="/icons/trashcan.svg"
            width={16}
            height={16}
            alt="delete"
          />
        </div>
      </div>

      {/* ---------------- SUPPORTING PHOTOS ---------------- */}

      <div className="bg-white border border-black/10 rounded-[16px] p-6 flex flex-col gap-6">
        <h3 className="text-lg font-medium">Supporting Photos</h3>

        <p className="text-sm text-gray-600">
          You may upload up to five additional photos that help tell your
          garden’s story.
          <br />
          *Please choose real, authentic photos of your project — for example,
          people working in the garden, harvesting food, learning together, or
          the garden space itself.
          <br />
          *Do not upload logos, flyers, graphics, or AI-generated images. These
          photos should reflect real people and real places connected to your
          project.
        </p>

        {/* Uploaded file items */}

        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/icons/upload-icon.svg"
                width={20}
                height={20}
                alt="file"
              />
              <div>
                <p className="text-sm">document_file_name.pdf</p>
                <p className="text-sm text-gray-500">100kb • Complete</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Image
                src="/icons/trashcan.svg"
                width={16}
                height={16}
                alt="delete"
              />
              <Image
                src="/icons/check-filled.svg"
                width={20}
                height={20}
                alt="complete"
              />
            </div>
          </div>
        ))}
      </div>

      {/* ---------------- CONTACT INFORMATION ---------------- */}

      <h2 className="text-xl font-semibold">Contact Information</h2>

      {/* Organization */}

      <div className="bg-white border border-black/10 rounded-[16px] p-6 flex flex-col gap-4">
        <h3 className="text-lg font-medium">
          Organization Information <span className="text-orange-500">*</span>
        </h3>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">
            Legal Name of Beneficiary Organization
          </label>

          <p>Fully Belly Community Garden</p>
          <div className="border-b border-gray-300"></div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">
            EIN or Public-Sector Identifier
          </label>

          <p>Fully Belly Community Garden</p>
          <div className="border-b border-gray-300"></div>
        </div>
      </div>

      {/* Mailing Address */}

      <div className="bg-white border border-black/10 rounded-[16px] p-6 flex flex-col gap-4">
        <h3 className="text-lg font-medium">
          Beneficiary Organization Mailing Address{" "}
          <span className="text-orange-500">*</span>
        </h3>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Street 1</label>
          <p>123 Scarborough Dr</p>
          <div className="border-b border-gray-300"></div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-400">Street 2</label>
          <div className="border-b border-gray-300 mt-2"></div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">City</label>
          <p>Scarborough</p>
          <div className="border-b border-gray-300"></div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">State / Province</label>
          <p>Maine</p>
          <div className="border-b border-gray-300"></div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">ZIP / Postal Code</label>
          <p>98921</p>
          <div className="border-b border-gray-300"></div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Country</label>
          <p>United States</p>
          <div className="border-b border-gray-300"></div>
        </div>
      </div>

      {/* Contact */}

      <div className="bg-white border border-black/10 rounded-[16px] p-6 flex flex-col gap-4">
        <h3 className="text-lg font-medium">
          Primary Contact Information <span className="text-orange-500">*</span>
        </h3>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">First Name</label>
          <p>Roger</p>
          <div className="border-b border-gray-300"></div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Last Name</label>
          <p>Doiron</p>
          <div className="border-b border-gray-300"></div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Email</label>
          <p>rogerdoiron@gmail.com</p>
          <div className="border-b border-gray-300"></div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Role or Title</label>
          <p>Director</p>
          <div className="border-b border-gray-300"></div>
        </div>
      </div>

      {/* NAV BUTTONS */}

      <div className="flex justify-between pt-4">
        <Button
          component={Link}
          href="/apply/contact"
          variant="outlined"
          size="medium"
        >
          Previous Step
        </Button>

        {/* TODO: Implement submit functionality */}
        <Button
          href="/apply/submit"
          variant={false ? "contained" : "text"}
          className={false ? "px-4!" : "bg-[#E0E0E0]! px-4!"}
          size="medium"
          disabled={!false}
        >
          Submit Application
        </Button>
      </div>
    </div>
  );
}
