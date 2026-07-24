function canAccessAdmin(role) {
  return role === "ADMIN" || role === "SECRETARY";
}
export {
  canAccessAdmin as c
};
