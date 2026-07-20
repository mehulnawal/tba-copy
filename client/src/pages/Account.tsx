import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/user.api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Eye, EyeOff } from "lucide-react";

interface Address {
    _id: string;
    fullName: string;
    phone: string;
    houseNo: string;
    area: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    isDefault: boolean;
}

interface AddressPayload {
    fullName: string;
    phone: string;
    houseNo: string;
    area: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
}

export default function Account() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    // Active Tab: 'profile' or 'addresses'
    const [activeTab, setActiveTab] = useState<"profile" | "addresses">("profile");

    // --- Profile Queries & Mutations ---
    const { data: profile, isLoading: isProfileLoading } = useQuery({
        queryKey: ["profile"],
        queryFn: userApi.getProfile,
    });

    const updateProfileMutation = useMutation({
        mutationFn: userApi.updateProfile,
        onSuccess: () => {
            showToast("Profile updated successfully", "success");
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
        onError: (err: any) => {
            showToast(err?.response?.data?.message || "Failed to update profile", "error");
        },
    });

    const changePasswordMutation = useMutation({
        mutationFn: ({ currentPassword, newPassword }: any) =>
            userApi.changePassword(currentPassword, newPassword),
        onSuccess: () => {
            showToast("Password changed successfully", "success");
        },
        onError: (err: any) => {
            showToast(err?.response?.data?.message || "Failed to change password", "error");
        },
    });

    // --- Addresses Queries & Mutations ---
    const { data: addresses = [], isLoading: isAddressesLoading } = useQuery<Address[]>({
        queryKey: ["addresses"],
        queryFn: userApi.getAddresses,
    });

    const addAddressMutation = useMutation({
        mutationFn: userApi.addAddress,
        onSuccess: () => {
            showToast("Address added successfully", "success");
            queryClient.invalidateQueries({ queryKey: ["addresses"] });
            setIsModalOpen(false);
            resetAddressForm();
        },
        onError: (err: any) => {
            showToast(err?.response?.data?.message || "Failed to add address", "error");
        },
    });

    const updateAddressMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: AddressPayload }) =>
            userApi.updateAddress(id, payload),
        onSuccess: () => {
            showToast("Address updated successfully", "success");
            queryClient.invalidateQueries({ queryKey: ["addresses"] });
            setIsModalOpen(false);
            resetAddressForm();
        },
        onError: (err: any) => {
            showToast(err?.response?.data?.message || "Failed to update address", "error");
        },
    });

    const deleteAddressMutation = useMutation({
        mutationFn: userApi.deleteAddress,
        onSuccess: () => {
            showToast("Address removed successfully", "success");
            queryClient.invalidateQueries({ queryKey: ["addresses"] });
        },
        onError: (err: any) => {
            showToast(err?.response?.data?.message || "Failed to delete address", "error");
        },
    });

    const setDefaultAddressMutation = useMutation({
        mutationFn: userApi.setDefaultAddress,
        onSuccess: () => {
            showToast("Default address updated", "success");
            queryClient.invalidateQueries({ queryKey: ["addresses"] });
        },
        onError: (err: any) => {
            showToast(err?.response?.data?.message || "Failed to set default address", "error");
        },
    });

    // --- Local Form States ---
    const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
    React.useEffect(() => {
        if (profile) {
            setProfileForm({ name: profile.name || "", phone: profile.phone || "" });
        }
    }, [profile]);

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });

    // Visibility States for all 3 password fields
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
    const [addressForm, setAddressForm] = useState<AddressPayload>({
        fullName: "",
        phone: "",
        houseNo: "",
        area: "",
        landmark: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
    });

    const resetAddressForm = () => {
        setAddressForm({
            fullName: "",
            phone: "",
            houseNo: "",
            area: "",
            landmark: "",
            city: "",
            state: "",
            pincode: "",
            country: "India",
        });
        setEditingAddressId(null);
    };

    // --- Handlers ---
    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!profileForm.name.trim()) return showToast("Name is required", "error");
        updateProfileMutation.mutate(profileForm);
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!passwordForm.currentPassword) return showToast("Current password is required", "error");
        if (passwordForm.newPassword.length < 6) {
            return showToast("New password must be at least 6 characters", "error");
        }
        if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
            return showToast("New passwords do not match", "error");
        }
        changePasswordMutation.mutate(
            {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            },
            {
                onSuccess: () => {
                    setPasswordForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
                    setShowCurrentPassword(false);
                    setShowNewPassword(false);
                    setShowConfirmPassword(false);
                },
            }
        );
    };

    const handleAddressSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { fullName, phone, houseNo, area, city, state, pincode, country } = addressForm;
        if (!fullName || !phone || !houseNo || !area || !city || !state || !pincode || !country) {
            return showToast("Please fill in all required fields", "error");
        }

        if (editingAddressId) {
            updateAddressMutation.mutate({ id: editingAddressId, payload: addressForm });
        } else {
            addAddressMutation.mutate(addressForm);
        }
    };

    const openEditAddressModal = (address: Address) => {
        setEditingAddressId(address._id);
        setAddressForm({
            fullName: address.fullName,
            phone: address.phone,
            houseNo: address.houseNo,
            area: address.area,
            landmark: address.landmark || "",
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            country: address.country,
        });
        setIsModalOpen(true);
    };

    const handleLogoutClick = async () => {
        try {
            await logout();
            showToast("Logged out safely.", "success");
            window.location.href = "/";
        } catch {
            showToast("An error occurred during logout.", "error");
        }
    };

    const [activeCategory, setActiveCategory] = useState<string>("All");
    const [, setSearchQuery] = useState("");

    return (
        <>
            <Navbar
                onSearchChange={setSearchQuery}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
            />

            <div className="min-h-screen bg-[var(--color-bg)] py-16 px-4 md:px-8">
                <div className="container max-w-5xl mx-auto">
                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[var(--color-cream)] pb-6 mb-12">
                        <div>
                            <span className="section-label">Your Sanctuary</span>
                            <h1 className="text-3xl md:text-4xl font-primary uppercase tracking-wide text-[var(--color-teal)]">
                                My Account
                            </h1>
                        </div>
                        <button
                            onClick={handleLogoutClick}
                            className="mt-4 sm:mt-0 self-start sm:self-auto text-xs uppercase tracking-widest text-[var(--color-teal)] hover:text-[var(--color-teal-light)] transition duration-300 underline underline-offset-4"
                        >
                            Log Out
                        </button>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex flex-wrap gap-8 mb-10 border-b border-[var(--color-border-subtle)] pb-2">
                        <button
                            onClick={() => setActiveTab("profile")}
                            className={`font-secondary pb-2 text-sm uppercase tracking-widest transition-all duration-300 relative ${activeTab === "profile"
                                    ? "text-[var(--color-teal)] font-medium"
                                    : "text-[var(--color-text-muted)] hover:text-[var(--color-teal)]"
                                }`}
                        >
                            Personal Details
                            {activeTab === "profile" && (
                                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--color-teal)]" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("addresses")}
                            className={`font-secondary pb-2 text-sm uppercase tracking-widest transition-all duration-300 relative ${activeTab === "addresses"
                                    ? "text-[var(--color-teal)] font-medium"
                                    : "text-[var(--color-text-muted)] hover:text-[var(--color-teal)]"
                                }`}
                        >
                            Address Book
                            {activeTab === "addresses" && (
                                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--color-teal)]" />
                            )}
                        </button>
                        <button
                            onClick={() => navigate("/orders")}
                            className="font-secondary pb-2 text-sm uppercase tracking-widest transition-all duration-300 relative text-[var(--color-text-muted)] hover:text-[var(--color-teal)]"
                        >
                            My Orders
                        </button>
                    </div>

                    {/* --- PROFILE TAB --- */}
                    {activeTab === "profile" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            <div className="md:col-span-2">
                                <h2 className="font-primary text-xl uppercase tracking-wider mb-6 text-[var(--color-teal)]">
                                    Profile Details
                                </h2>
                                {isProfileLoading ? (
                                    <div className="space-y-4">
                                        <div className="skeleton h-12 w-full" />
                                        <div className="skeleton h-12 w-full" />
                                    </div>
                                ) : (
                                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                                        <div>
                                            <label className="block text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                                                Email Address (Read-only)
                                            </label>
                                            <input
                                                type="email"
                                                value={profile?.email || ""}
                                                disabled
                                                className="w-full bg-[var(--color-cream-light)] border border-[var(--color-cream)] text-[var(--color-text-muted)] px-4 py-3 font-secondary text-sm focus:outline-none cursor-not-allowed"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                                                    Full Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={profileForm.name}
                                                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                                    className="w-full bg-transparent border border-[var(--color-cream)] text-[var(--color-text)] px-4 py-3 font-secondary text-sm focus:outline-none focus:border-[var(--color-teal)] transition duration-300"
                                                    placeholder="John Doe"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                                                    Phone Number
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={profileForm.phone}
                                                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                    className="w-full bg-transparent border border-[var(--color-cream)] text-[var(--color-text)] px-4 py-3 font-secondary text-sm focus:outline-none focus:border-[var(--color-teal)] transition duration-300"
                                                    placeholder="e.g. +1 555-0100"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={updateProfileMutation.isPending}
                                            className="bg-[var(--color-teal)] text-white px-8 py-3 text-xs uppercase tracking-widest font-secondary hover:bg-[var(--color-teal-dark)] transition duration-300 disabled:opacity-50"
                                        >
                                            {updateProfileMutation.isPending ? "Saving..." : "Save Profile Details"}
                                        </button>
                                    </form>
                                )}
                            </div>

                            <div className="bg-[var(--color-bg-secondary)] p-6 border border-[var(--color-cream)] self-start">
                                <h3 className="font-primary text-lg uppercase tracking-wider mb-6 text-[var(--color-teal)]">
                                    Security
                                </h3>
                                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
                                            Current Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showCurrentPassword ? "text" : "password"}
                                                value={passwordForm.currentPassword}
                                                onChange={(e) =>
                                                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                                                }
                                                className="w-full bg-[var(--color-bg)] border border-[var(--color-cream)] text-[var(--color-text)] pl-3 pr-10 py-2.5 font-secondary text-xs focus:outline-none focus:border-[var(--color-teal)] transition duration-300"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-teal)] transition duration-200"
                                            >
                                                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                value={passwordForm.newPassword}
                                                onChange={(e) =>
                                                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                                                }
                                                className="w-full bg-[var(--color-bg)] border border-[var(--color-cream)] text-[var(--color-text)] pl-3 pr-10 py-2.5 font-secondary text-xs focus:outline-none focus:border-[var(--color-teal)] transition duration-300"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-teal)] transition duration-200"
                                            >
                                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
                                            Confirm New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={passwordForm.confirmNewPassword}
                                                onChange={(e) =>
                                                    setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })
                                                }
                                                className="w-full bg-[var(--color-bg)] border border-[var(--color-cream)] text-[var(--color-text)] pl-3 pr-10 py-2.5 font-secondary text-xs focus:outline-none focus:border-[var(--color-teal)] transition duration-300"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-teal)] transition duration-200"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={changePasswordMutation.isPending}
                                        className="w-full bg-transparent border border-[var(--color-teal)] text-[var(--color-teal)] hover:bg-[var(--color-teal)] hover:text-white px-4 py-2.5 text-xs uppercase tracking-widest font-secondary transition-all duration-300 disabled:opacity-50"
                                    >
                                        {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* --- ADDRESSES TAB --- */}
                    {activeTab === "addresses" && (
                        <div>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="font-primary text-xl uppercase tracking-wider text-[var(--color-teal)]">
                                    Registered Addresses
                                </h2>
                                <button
                                    onClick={() => {
                                        resetAddressForm();
                                        setIsModalOpen(true);
                                    }}
                                    className="bg-[var(--color-teal)] text-white px-5 py-2.5 text-xs uppercase tracking-widest font-secondary hover:bg-[var(--color-teal-dark)] transition duration-300"
                                >
                                    Add New Address
                                </button>
                            </div>

                            {isAddressesLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="skeleton h-44 w-full" />
                                    <div className="skeleton h-44 w-full" />
                                </div>
                            ) : addresses.length === 0 ? (
                                <div className="text-center py-12 border border-dashed border-[var(--color-cream)]">
                                    <p className="font-secondary text-sm text-[var(--color-text-muted)]">
                                        You have not registered any physical delivery addresses yet.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {addresses.map((address) => (
                                        <div
                                            key={address._id}
                                            className={`p-6 border transition-all duration-300 flex flex-col justify-between ${address.isDefault
                                                    ? "border-[var(--color-teal)] bg-[var(--color-bg-secondary)] shadow-cream"
                                                    : "border-[var(--color-cream)] bg-transparent"
                                                }`}
                                        >
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-primary text-base uppercase tracking-wider text-[var(--color-teal)]">
                                                        {address.fullName}
                                                    </h4>
                                                    {address.isDefault && (
                                                        <span className="text-[10px] bg-[var(--color-teal)] text-white px-2 py-0.5 uppercase tracking-widest">
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="font-secondary text-xs text-[var(--color-text)] space-y-1">
                                                    <span>{address.houseNo}, {address.area}</span>
                                                    {address.landmark && <span className="block italic text-[var(--color-text-muted)]">Near {address.landmark}</span>}
                                                    <span className="block">{address.city}, {address.state} — {address.pincode}</span>
                                                    <span className="block font-medium tracking-wide">{address.country}</span>
                                                    <span className="block text-[var(--color-text-muted)] mt-2">Ph: {address.phone}</span>
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4 mt-6 border-t border-[var(--color-border-subtle)] pt-4">
                                                <button
                                                    onClick={() => openEditAddressModal(address)}
                                                    className="text-xs font-secondary uppercase tracking-widest text-[var(--color-teal)] hover:text-[var(--color-teal-light)] transition duration-300"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm("Are you sure you want to delete this address?")) {
                                                            deleteAddressMutation.mutate(address._id);
                                                        }
                                                    }}
                                                    className="text-xs font-secondary uppercase tracking-widest text-[var(--color-error)] hover:opacity-85 transition duration-300"
                                                >
                                                    Delete
                                                </button>
                                                {!address.isDefault && (
                                                    <button
                                                        onClick={() => setDefaultAddressMutation.mutate(address._id)}
                                                        className="text-xs font-secondary uppercase tracking-widest text-[var(--color-teal-light)] hover:text-[var(--color-teal)] ml-auto transition duration-300"
                                                    >
                                                        Set Default
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Modal: Add/Edit Address */}
                    {isModalOpen && (
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[400] flex items-center justify-center p-4">
                            <div className="bg-[var(--color-bg)] border border-[var(--color-cream)] max-w-lg w-full max-h-[90vh] overflow-y-auto p-8 shadow-lg">
                                <div className="flex justify-between items-center border-b border-[var(--color-cream)] pb-4 mb-6">
                                    <h3 className="font-primary text-xl uppercase tracking-wider text-[var(--color-teal)]">
                                        {editingAddressId ? "Edit Address" : "Add Address"}
                                    </h3>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="text-[var(--color-text-muted)] hover:text-[var(--color-teal)] text-xl font-light"
                                    >
                                        &times;
                                    </button>
                                </div>

                                <form onSubmit={handleAddressSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
                                            Full Name <span className="text-[var(--color-error)]">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={addressForm.fullName}
                                            onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                                            className="w-full bg-transparent border border-[var(--color-cream)] px-3 py-2 text-sm font-secondary focus:outline-none focus:border-[var(--color-teal)]"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
                                                Phone Number <span className="text-[var(--color-error)]">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                required
                                                value={addressForm.phone}
                                                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                                className="w-full bg-transparent border border-[var(--color-cream)] px-3 py-2 text-sm font-secondary focus:outline-none focus:border-[var(--color-teal)]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
                                                House / Apt / Unit <span className="text-[var(--color-error)]">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={addressForm.houseNo}
                                                onChange={(e) => setAddressForm({ ...addressForm, houseNo: e.target.value })}
                                                className="w-full bg-transparent border border-[var(--color-cream)] px-3 py-2 text-sm font-secondary focus:outline-none focus:border-[var(--color-teal)]"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
                                            Area / Street / Village <span className="text-[var(--color-error)]">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={addressForm.area}
                                            onChange={(e) => setAddressForm({ ...addressForm, area: e.target.value })}
                                            className="w-full bg-transparent border border-[var(--color-cream)] px-3 py-2 text-sm font-secondary focus:outline-none focus:border-[var(--color-teal)]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
                                            Landmark (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={addressForm.landmark}
                                            onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                                            className="w-full bg-transparent border border-[var(--color-cream)] px-3 py-2 text-sm font-secondary focus:outline-none focus:border-[var(--color-teal)]"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
                                                City <span className="text-[var(--color-error)]">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={addressForm.city}
                                                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                                className="w-full bg-transparent border border-[var(--color-cream)] px-3 py-2 text-sm font-secondary focus:outline-none focus:border-[var(--color-teal)]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
                                                State / Province <span className="text-[var(--color-error)]">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={addressForm.state}
                                                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                                className="w-full bg-transparent border border-[var(--color-cream)] px-3 py-2 text-sm font-secondary focus:outline-none focus:border-[var(--color-teal)]"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
                                                Pincode / ZIP <span className="text-[var(--color-error)]">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={addressForm.pincode}
                                                onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                                                className="w-full bg-transparent border border-[var(--color-cream)] px-3 py-2 text-sm font-secondary focus:outline-none focus:border-[var(--color-teal)]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
                                                Country <span className="text-[var(--color-error)]">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={addressForm.country}
                                                onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                                                className="w-full bg-transparent border border-[var(--color-cream)] px-3 py-2 text-sm font-secondary focus:outline-none focus:border-[var(--color-teal)]"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex space-x-4 pt-4 border-t border-[var(--color-cream)] mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="w-1/2 border border-[var(--color-cream)] text-[var(--color-teal)] py-3 text-xs uppercase tracking-widest font-secondary hover:bg-[var(--color-cream-light)] transition duration-300"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={addAddressMutation.isPending || updateAddressMutation.isPending}
                                            className="w-1/2 bg-[var(--color-teal)] text-white py-3 text-xs uppercase tracking-widest font-secondary hover:bg-[var(--color-teal-dark)] transition duration-300 disabled:opacity-50"
                                        >
                                            {addAddressMutation.isPending || updateAddressMutation.isPending
                                                ? "Saving..."
                                                : "Save Address"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Footer onCategoryChange={setActiveCategory} />
        </>
    );
}