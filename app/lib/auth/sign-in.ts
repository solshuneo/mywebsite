import { authClient } from "@/lib/auth/auth-client";

/**
 * Hàm xử lý đăng nhập bằng email và mật khẩu.
 * Dựa trên tài liệu Better Auth: https://www.better-auth.com/docs/basic-usage#sign-in
 */
export const handleSignIn = async (
    email: string,
    password: string,
    rememberMe: boolean = true,
) => {
    const { data, error } = await authClient.signIn.email(
        {
            email,
            password,
            callbackURL: "/dashboard",
            rememberMe,
        },
        {
            onRequest: (ctx) => {
                // Hiển thị trạng thái đang xử lý (loading)
                console.log("Đang đăng nhập...");
            },
            onSuccess: (ctx) => {
                // Xử lý sau khi đăng nhập thành công
                // Mặc định Better Auth sẽ tự điều hướng nếu có callbackURL
                window.location.href = "/dashboard";
            },
            onError: (ctx) => {
                // Hiển thị thông báo lỗi
                alert(
                    ctx.error.message ||
                        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.",
                );
            },
        },
    );

    return { data, error };
};
