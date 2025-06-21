export const hasPermission = (user, module, action) => {
    if (!user?.role?.permissions) return false;
    const modulePermissions = user.role.permissions[module] || [];
    return modulePermissions.includes(action);
};