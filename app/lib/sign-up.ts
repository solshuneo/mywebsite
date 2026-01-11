import { authClient } from "@/lib/auth-client";

export const handleSignUp = async (
    email: string,
    password: string,
    name: string,
    image?: string,
) => {
    const { data, error } = await authClient.signUp.email(
        {
            email,
            password,
            name,
            image,
            callbackURL: "/dashboard",
        },
        {
            onRequest: (ctx) => {
                // console.log("Đang gửi yêu cầu...");
            },
            onSuccess: (ctx) => {
                // Chuyển hướng hoặc thông báo thành công
                window.location.href = "/dashboard";
            },
            onError: (ctx) => {
                // Hiển thị lỗi
                alert(ctx.error.message);
            },
        },
    );

    return { data, error };
};
