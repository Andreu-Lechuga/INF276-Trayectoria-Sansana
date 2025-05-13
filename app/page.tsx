import AppContainer from "@/components/app-container"
import DebugJsonPaths from "@/components/debug-json-paths"
import VerifyJsonPaths from "@/components/verify-json-paths"

export default function Home() {
  return (
    <>
      <VerifyJsonPaths />
      <DebugJsonPaths />
      <AppContainer />
    </>
  )
}
