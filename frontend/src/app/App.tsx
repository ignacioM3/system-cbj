import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "../App.css";
import { sileo, Toaster } from "sileo";
import { routeList } from "./routes/routes";
import { LazyComponentLoader } from "./routes/lazy-component-loader";
import { AuthProvider } from "../context/auth-provider";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {routeList.map((route, index) => {
            if (route.redirect) {
              return (
                <Route
                  key={index}
                  path={route.route()}
                  Component={() => (
                    <Navigate to={route.redirect as string} replace={true} />
                  )}
                />
              );
            }

            return (
              <Route
                key={index}
                path={route.route()}
                Component={() => <LazyComponentLoader route={route} />}
              />
            );
          })}
        </Routes>
        <Toaster
          position="top-center"
          options={{
            fill: "#18181B",
            roundness: 12,
            styles: {
              title: "text-white!",
              description: "text-white/70!",
              badge: "bg-violet-500/15! text-violet-400!",
              button: "bg-white/10! hover:bg-white/15!",
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
