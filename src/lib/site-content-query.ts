import { queryOptions } from "@tanstack/react-query";
import { getSiteContent } from "./site-content.functions";

export const siteContentQuery = queryOptions({
  queryKey: ["site-content"],
  queryFn: () => getSiteContent(),
});
