-- Public bucket for images uploaded in the admin email editor.
-- Public so the image links work for email recipients who aren't logged in.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'email_images',
  'email_images',
  true,
  3145728, -- 3 MB, matching the upload box on the Email Users page
  array['image/png', 'image/jpeg', 'image/gif']
);

-- Only admins can upload
create policy "Admins can upload email images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'email_images'
  and (select public.is_in_app_admin())
);
