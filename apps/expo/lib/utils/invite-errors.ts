export function mapInviteApiError(message: string): string {
  if (message.includes("expired") || message.includes("Invalid"))
    return "Ce lien d'invitation a expire. Demandez un nouveau code a votre ami.";
  if (message.includes("own invite"))
    return "Vous ne pouvez pas accepter votre propre invitation.";
  if (message.includes("Already friends")) return "Vous etes deja amis !";
  return message || "Une erreur est survenue";
}

export function isAlreadyFriendsError(message: string): boolean {
  return message.includes("Already friends");
}
