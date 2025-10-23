# Pack Download Files

This directory contains the downloadable pack files (ZIP archives) that users receive after purchasing.

## File Structure

Each pack is a ZIP file named according to its pack ID:
- `vol-1.zip` - Desi Bass Edits Vol. 1
- `vol-2.zip` - Desi Bass Edits Vol. 2
- `vol-3.zip` - Desi Bass Edits Vol. 3
- `vol-4.zip` - Desi Bass Edits Vol. 4
- `vol-5.zip` - Desi Bass Edits Vol. 5

## Pack Contents

Each ZIP file should contain:
- High-quality WAV files (24-bit or 16-bit)
- README.txt with usage instructions
- License information
- Optional: Cover artwork and track listing

## File Size Considerations

If pack files are large (>100MB each), consider using Supabase Storage instead of committing them to Git:

1. Create a `packs` bucket in Supabase Storage
2. Upload ZIP files with the same naming convention
3. Update `app/api/downloads/route.ts` to generate signed URLs
4. Signed URLs provide time-limited, secure access to files

## Security Notes

- Files in `/public` are accessible to anyone who knows the URL
- For better security, use Supabase Storage with signed URLs
- Signed URLs expire after a set time (e.g., 1 hour)
- This prevents unauthorized sharing of download links

## Deployment

- Ensure pack files are included in your deployment
- Vercel has a 100MB limit for serverless functions
- Large files may require CDN or external storage solution
