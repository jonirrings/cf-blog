import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import i18n from "@cf-blog/i18n";
import "./app.css";

export default function App() {
  return (
    <Router
      root={(props) => (
        <Suspense fallback={<div class="loading">{i18n.t("common.loading")}</div>}>
          {props.children}
        </Suspense>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
