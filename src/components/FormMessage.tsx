import type { ActionState } from "@/app/(auth)/actions";

export function FormMessage({ state }: { state: ActionState }) {
  if (!state) return null;
  if (state.error) return <p className="form-message form-message--error">{state.error}</p>;
  if (state.message) return <p className="form-message form-message--ok">{state.message}</p>;
  return null;
}
