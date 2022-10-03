import { lazy, Suspense } from "react";
import { type RouteObject } from "react-router-dom";

const Index = lazy(() => import("@/routes/index"));
const Notfound = lazy(() => import("@/routes/404"));
const Edit = lazy(() => import("@/routes/edit"));
const CSSEdit = lazy(() => import("@/routes/css_edit"));
const EditorCompletion = lazy(() => import("@/routes/complete"));
const printVal = (val) => {
  console.log(val);
};

export const routes: Array<RouteObject> = [
  {
    index: true,
    element: (
      <Suspense>
        <Index />
      </Suspense>
    ),
  },
  {
    path: "/edit",
    element: (
      <Suspense>
        <Edit onChange={printVal} />
      </Suspense>
    ),
  },
  {
    path: "/editor/css",
    element: (
      <Suspense>
        <CSSEdit onChange={printVal} />
      </Suspense>
    ),
  },
  {
    path: "/editor/complete",
    element: (
      <Suspense>
        <EditorCompletion onChange={printVal} />
      </Suspense>
    ),
  },
  {
    path: "*",
    element: (
      <Suspense>
        <Notfound />
      </Suspense>
    ),
  },
];

export default routes;
