create policy "Admin can manage resume files" on storage.objects
  for all to authenticated
  using (bucket_id = 'resumes' and public.has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'resumes' and public.has_role(auth.uid(), 'admin'));