import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthGuard } from "./AuthGuard";

// Mock next/navigation
const mockRedirect = vi.fn();
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));

// Mock getServerUser
const mockGetServerUser = vi.fn();
vi.mock("@/lib/supabase/auth", () => ({
  getServerUser: () => mockGetServerUser(),
}));

describe("AuthGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("user가 있으면 children을 렌더링한다", async () => {
    mockGetServerUser.mockResolvedValue({ id: "user-123", email: "test@example.com" });

    const result = await AuthGuard({
      children: <div>Protected Content</div>,
    });

    expect(result).toEqual(<><div>Protected Content</div></>);
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("user가 없으면 기본 경로(/auth)로 리다이렉트한다", async () => {
    mockGetServerUser.mockResolvedValue(null);

    await expect(
      AuthGuard({
        children: <div>Protected Content</div>,
      })
    ).rejects.toThrow("NEXT_REDIRECT:/auth");

    expect(mockRedirect).toHaveBeenCalledWith("/auth");
  });

  it("user가 없으면 지정된 경로로 리다이렉트한다", async () => {
    mockGetServerUser.mockResolvedValue(null);

    await expect(
      AuthGuard({
        children: <div>Protected Content</div>,
        redirectTo: "/login",
      })
    ).rejects.toThrow("NEXT_REDIRECT:/login");

    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });

  it("user가 undefined이면 리다이렉트한다", async () => {
    mockGetServerUser.mockResolvedValue(undefined);

    await expect(
      AuthGuard({
        children: <div>Protected Content</div>,
      })
    ).rejects.toThrow("NEXT_REDIRECT:/auth");

    expect(mockRedirect).toHaveBeenCalledWith("/auth");
  });
});
