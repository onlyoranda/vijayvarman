CREATE POLICY "Admin can read profile photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'profile-photos' AND private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admin can upload profile photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'profile-photos' AND private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admin can replace profile photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'profile-photos' AND private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (bucket_id = 'profile-photos' AND private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admin can delete profile photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'profile-photos' AND private.has_role(auth.uid(), 'admin'::public.app_role));