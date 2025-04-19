# Delivery Manual

## Supabase Setup

Follow these steps to set up Supabase for this application:

1. **Create a Supabase account**
   - Sign up at [https://supabase.com/](https://supabase.com/)

2. **Create a new project**
   - Click "New Project"
   - Enter a project name (e.g., "delivery-manual")
   - Set a secure database password (save it somewhere safe)
   - Choose a region closest to your users
   - Click "Create project"

3. **Get your API credentials**
   - In your project dashboard, go to Project Settings > API
   - Copy your "Project URL" and "anon/public" key (NOT the secret key)

4. **Update environment variables**
   - Open `src/environments/environment.ts`
   - Replace 'YOUR_SUPABASE_URL' with your Project URL
   - Replace 'YOUR_SUPABASE_ANON_KEY' with your anon/public key
   ```typescript
   export const environment = {
     production: false,
     supabaseUrl: 'https://your-project-id.supabase.co',
     supabaseKey: 'your-anon-key',
   };
   ```

5. **Create the database schema**
   - Go to the SQL Editor in your Supabase dashboard
   - Click "New query"
   - Copy and paste the contents of `supabase/setup.sql`
   - Click "Run" to execute the SQL queries

6. **Configure Storage**
   - Go to Storage in your Supabase dashboard
   - Click "Create new bucket"
   - Enter "store-images" as the bucket name
   - Enable public access if you want images to be publicly accessible
   - Click "Create bucket"
   - Set bucket policies:
     - Go to the "Policies" tab for your bucket
     - Add policies for:
       - Public read access (if needed)
       - Authenticated user uploads
       - Authenticated user deletions

7. **Test the connection**
   - Run the application with `npm start`
   - Check browser console for any Supabase connection errors
   - Try creating a store and verify it appears in your Supabase database

8. **Supabase usage example**
   ```typescript
   import { Component, OnInit } from '@angular/core';
   import { SupabaseService } from '../../services/supabase.service';
   import { Store } from '../../models/store.model';

   @Component({
     selector: 'app-store-list',
     templateUrl: './store-list.component.html',
     styleUrls: ['./store-list.component.css']
   })
   export class StoreListComponent implements OnInit {
     stores: Store[] = [];
     
     constructor(private supabaseService: SupabaseService) {}
     
     async ngOnInit() {
       try {
         this.stores = await this.supabaseService.getStores();
       } catch (error) {
         console.error('Error loading stores:', error);
       }
     }
   }
   ```

9. **Common issues and solutions**
   - If you get CORS errors, check your Supabase project's API settings
   - If images don't load, verify your storage bucket has the correct public access policy
   - If queries fail, check the database permissions and RLS policies 