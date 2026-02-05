import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ClientAuthGuard } from "./ClientAuthGuard";

// Mock useRouter
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock useAuth
const mockUseAuth = vi.fn();
vi.mock("@/lib/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("ClientAuthGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loading 상태에서 fallback을 렌더링한다", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });

    render(
      <ClientAuthGuard>
        <div>Protected Content</div>
      </ClientAuthGuard>
    );

    expect(screen.getByText("로딩 중...")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("loading 상태에서 커스텀 fallback을 렌더링한다", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });

    render(
      <ClientAuthGuard fallback={<div>Custom Loading...</div>}>
        <div>Protected Content</div>
      </ClientAuthGuard>
    );

    expect(screen.getByText("Custom Loading...")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("user가 있으면 children을 렌더링한다", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "user-123", email: "test@example.com" },
      loading: false,
    });

    render(
      <ClientAuthGuard>
        <div>Protected Content</div>
      </ClientAuthGuard>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("user가 없으면 기본 경로(/auth)로 리다이렉트한다", async () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });

    render(
      <ClientAuthGuard>
        <div>Protected Content</div>
      </ClientAuthGuard>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/auth");
    });

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("user가 없으면 지정된 경로로 리다이렉트한다", async () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });

    render(
      <ClientAuthGuard redirectTo="/login">
        <div>Protected Content</div>
      </ClientAuthGuard>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("loading이 끝난 후 user가 없으면 null을 렌더링한다", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });

    const { container } = render(
      <ClientAuthGuard>
        <div>Protected Content</div>
      </ClientAuthGuard>
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    expect(screen.queryByText("로딩 중...")).not.toBeInTheDocument();
    expect(container.innerHTML).toBe("");
  });
});
