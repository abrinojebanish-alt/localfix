-- Public bucket for provider profile photos. Images are public to read
-- (they're shown on public provider profiles); only the owning provider
-- (or an admin) can upload/replace/delete their own image.

insert into storage.buckets (id, name, public)
values ('provider-images', 'provider-images', true)
on conflict (id) do nothing;

create policy "provider_images_public_read"
  on storage.objects for select
  using (bucket_id = 'provider-images');

-- Files are stored as provider-images/{auth.uid()}/filename — the first path
-- segment must match the uploading user's id.
create policy "provider_images_owner_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'provider-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "provider_images_owner_update"
  on storage.objects for update
  using (
    bucket_id = 'provider-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "provider_images_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'provider-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
