# Put Focus Flow on GitHub and Vercel

Deploy the whole repository as **one Vercel project**. Vercel serves the React frontend and runs the Express API as a function. MongoDB Atlas stores tasks and notes. The `frontend/` and `backend/` folders stay separate, and no second backend hosting account is needed.

## 1. Upload your changes to GitHub

This project already uses the `main` branch and this GitHub remote:

**https://github.com/hibashakeel121/Focus_Flow**

Open a terminal in the project root, which contains `frontend/`, `backend/`, and `vercel.json`:

```powershell
git add .
git diff --cached --name-only
```

Check the listed filenames before committing. `backend/.env` must be absent; `backend/.env.example` should be included. The project's `.gitignore` excludes real environment files, installed dependencies, build output, and local database files.

```powershell
git commit -m "Prepare Focus Flow for deployment"
git push -u origin main
```

Sign in to GitHub if Git prompts you. If Git reports that the remote has newer commits, resolve those changes before pushing; do not force-push over them. GitHub's [guide for uploading local code](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github) explains authentication and remote setup.

## 2. Allow the deployment to connect to Atlas

Keep your existing Atlas cluster. Check that it is running and that its database user can read and write the database used by Focus Flow.

In Atlas, open **Network Access**, then **Add IP Address**. For this classroom demo using Vercel's default networking, choose **Allow Access from Anywhere** (`0.0.0.0/0`). Vercel's outbound addresses change, so allowing only your laptop's IP does not let the deployed API connect. MongoDB documents this in its [Vercel integration guide](https://www.mongodb.com/docs/atlas/reference/partner-integrations/vercel/).

This setting allows database connection attempts from any IP; a valid database username and password are still required. Use a strong password and a database user limited to this demo database. For restricted network access, Vercel offers [static outbound IP options](https://vercel.com/kb/guide/how-to-allowlist-deployment-ip-address).

## 3. Import the repository into Vercel

1. Sign in to [Vercel](https://vercel.com/new) with GitHub.
2. Import **Focus_Flow**. If it is missing, grant the Vercel GitHub integration access to that repository.
3. Name the project **focus-flow** or another available name.
4. Keep **Root Directory** at the repository root (`./`). Choosing `frontend/` would leave the API outside this deployment.
5. Use these settings, which are also saved in `vercel.json`:

| Setting | Value |
| --- | --- |
| Framework Preset | Other |
| Root Directory | `./` |
| Install Command | `MONGOMS_DISABLE_POSTINSTALL=1 npm ci` |
| Build Command | `npm run build` |
| Output Directory | `frontend/dist` |
| Node.js Version | `22.x` or a newer supported version |

The install command skips downloading the local MongoDB test binary during deployment. The hosted app uses Atlas.

Vercel supports an [`api/` folder alongside Vite](https://vercel.com/docs/frameworks/frontend/vite). Here, `api/index.js` calls the backend handler. The supplied routing configuration sends `/api/*` requests to Express and serves the React app for page URLs, including refreshed pages such as `/notepad`.

## 4. Add the database URL before deploying

In Vercel's **Environment Variables**, add:

| Name | Value | Environments |
| --- | --- | --- |
| `MONGODB_URI` | Your full MongoDB Atlas connection string | Production and Preview |

Select **Secret** for this variable if Vercel offers that choice. Copy the value from your local `backend/.env` yourself; do not upload the file or put the connection string in React code. Preserve the same database name in the URL if you want the deployment to show your existing tasks.

A placeholder example is:

```dotenv
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@YOUR-CLUSTER.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority
```

Paste only the connection string as the Vercel value, without `MONGODB_URI=` or surrounding quotes. Replace placeholders with your actual details. Do not name this variable `VITE_MONGODB_URI`: frontend variables are exposed to the browser. This deployment needs no `PORT` setting or separate frontend API URL.

Click **Deploy**. Vercel environment changes apply to new deployments, so [redeploy after changing a variable](https://vercel.com/docs/environment-variables).

## 5. Check the live application

After the deployment succeeds, open the provided `https://...vercel.app` URL:

1. Open `/api/health`. It should return `{"status":"ok","database":"connected"}`.
2. Open the To-Do page and add a task.
3. Refresh the page and confirm the task is still there.
4. Mark it completed, refresh, and confirm completion is saved.
5. Delete the test task and refresh to confirm it is gone.
6. Open `/notepad` directly and refresh it to check page routing.

If the health endpoint returns 503, check the Vercel `MONGODB_URI` value, Atlas database credentials, Network Access, and whether the cluster is paused. Vercel's function logs can help identify the failing step.

Focus Flow is a shared classroom demo with no login: visitors can view, change, and delete the same tasks and notes. Use assignment/demo data, not private information. Preview and production deployments also share data when given the same MongoDB URL.

## Publish later changes

After editing the app, run these commands from the project root:

```powershell
git add .
git commit -m "Describe your changes"
git push origin main
```

Vercel automatically deploys updates pushed to the connected production branch. Your laptop and local backend do not need to stay running for the hosted app to work.
