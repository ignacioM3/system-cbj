import jwt from "jsonwebtoken"

type UserPayload = {
  id: string
}

export const generateJWT = (payload: UserPayload) => {

  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required")
  }

  const token = jwt.sign(payload, secret, {
    expiresIn: "6d"
  })

  return token
}
