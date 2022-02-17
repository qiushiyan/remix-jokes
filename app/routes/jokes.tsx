import { Form, LinksFunction, LoaderFunction, useLoaderData } from "remix";
import { Outlet, Link } from "remix";

import stylesUrl from "~/styles/jokes.css";
import { db } from "~/utils/db.server";
import type { Joke } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

interface LoaderData {
  jokeListItems: Joke[];
  user: Awaited<ReturnType<typeof getUser>>;
}

export let loader: LoaderFunction = async ({ request }) => {
  const jokes = await db.joke.findMany({
    take: 5,
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
  });
  const user = await getUser(request);
  return {
    jokeListItems: jokes,
    user,
  };
};

export default function JokesRoute() {
  const { jokeListItems, user } = useLoaderData<LoaderData>();
  return (
    <div className="jokes-layout">
      <header className="jokes-header">
        <div className="container">
          <h1 className="home-link">
            <Link to="/" title="Remix Jokes" aria-label="Remix Jokes">
              <span className="logo">🤪</span>
              <span className="logo-medium">J🤪KES</span>
            </Link>
          </h1>
          {user ? (
            <div className="user-info">
              <span>{`Hi ${user.username}`}</span>
              <Form action="/logout" method="post">
                <button type="submit" className="button">
                  Logout
                </button>
              </Form>
            </div>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </header>
      <main className="jokes-main">
        <div className="container">
          <div className="jokes-list">
            <Link to=".">Get a random joke</Link>
            <p>Here are a few more jokes to check out:</p>
            <ul>
              {jokeListItems.map((joke) => {
                return (
                  <li>
                    <Link
                      prefetch="intent"
                      to={`/jokes/${joke.id}`}
                      key={joke.id}
                    >
                      {joke.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Link to="new" className="button">
              Add your own
            </Link>
          </div>
          <div className="jokes-outlet">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

export function ErrorBoundary() {
  return <div className="error-container">I did a whoopsies.</div>;
}
