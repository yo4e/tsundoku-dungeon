/** Design context — the app is a single full-screen "書庫銅版画" game plate. */
import ErrorBoundary from "./components/ErrorBoundary";
import GameCanvas from "./components/GameCanvas";

export default function App() {
  return (
    <ErrorBoundary>
      <GameCanvas />
    </ErrorBoundary>
  );
}
