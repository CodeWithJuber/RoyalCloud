import type { APIRoute } from "astro";

export const GET: APIRoute = ({ redirect }) => {
  return redirect("/legacy-assets/assets/images/cloudhost.png", 302);
};
