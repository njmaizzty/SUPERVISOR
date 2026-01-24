import { useAuth } from "@/contexts/AuthContext";

const { login } = useAuth();

const handleLogin = async () => {
  const response = await fetch("http://YOUR_IP:3000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (response.ok) {
    login({
      id: data.id,
      fullname: data.fullname,
      email: data.email,
    });

    router.replace("/dashboard");
  }
};
