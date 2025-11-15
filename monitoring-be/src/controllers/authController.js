import { loginService, getProfileService } from "../services/authService.js";

export const login = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({ 
        status: "error",
        message: "Username dan password wajib diisi",
        data: null
      });
    }

    const result = await loginService(username, password);
    res.status(200).json(result);
  } catch (error) {
    // Handle error dengan format yang konsisten
    res.status(400).json({
      status: "error",
      message: error.message,
      data: null
    });
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const result = await getProfileService(req.user.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
      data: null
    });
  }
};
