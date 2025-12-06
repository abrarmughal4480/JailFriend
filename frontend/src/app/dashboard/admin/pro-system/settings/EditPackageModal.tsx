import React, { useState, useEffect } from 'react';
import { X, Upload, Check } from 'lucide-react';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface ProPackage {
    _id?: string; // id from mongo
    id?: string; // fallback
    name: string;
    price: number;
    color: string;
    status: 'enabled' | 'disabled';
    featured: boolean;
    seeProfileVisitors: boolean;
    showLastSeen: boolean;
    verifiedBadge: boolean;
    pagesPromotion: number;
    postsPromotion: number;
    maxUploadSize: string;
    discount: number;
    duration: number;
    durationUnit: 'Day' | 'Week' | 'Month' | 'Year';
    icon?: string | File;
    nightIcon?: string | File;
    description: string;
}

interface EditPackageModalProps {
    isOpen: boolean;
    onClose: () => void;
    pkg: ProPackage | null;
    onSave: (pkg: FormData) => Promise<void>;
    isNew?: boolean;
}

const EditPackageModal: React.FC<EditPackageModalProps> = ({ isOpen, onClose, pkg, onSave, isNew }) => {
    const { isDarkMode } = useDarkMode();
    const [formData, setFormData] = useState<ProPackage>({
        name: '',
        price: 0,
        color: '#000000',
        status: 'enabled',
        featured: false,
        seeProfileVisitors: false,
        showLastSeen: false,
        verifiedBadge: false,
        pagesPromotion: 0,
        postsPromotion: 0,
        maxUploadSize: '24 MB',
        discount: 0,
        duration: 1,
        durationUnit: 'Month',
        description: '',
        icon: '',
        nightIcon: ''
    });

    const [iconFile, setIconFile] = useState<File | null>(null);
    const [nightIconFile, setNightIconFile] = useState<File | null>(null);
    const [iconPreview, setIconPreview] = useState<string>('');
    const [nightIconPreview, setNightIconPreview] = useState<string>('');

    useEffect(() => {
        if (pkg) {
            setFormData({ ...pkg });
            // Reset files
            setIconFile(null);
            setNightIconFile(null);
            // Set previews if urls exist
            if (typeof pkg.icon === 'string') setIconPreview(pkg.icon);
            if (typeof pkg.nightIcon === 'string') setNightIconPreview(pkg.nightIcon);
        } else {
            // Default state for new package
            setFormData({
                name: '',
                price: 0,
                color: '#22c55e',
                status: 'enabled',
                featured: false,
                seeProfileVisitors: false,
                showLastSeen: false,
                verifiedBadge: false,
                pagesPromotion: 0,
                postsPromotion: 0,
                maxUploadSize: '24 MB',
                discount: 0,
                duration: 1,
                durationUnit: 'Month',
                description: '',
                icon: '',
                nightIcon: ''
            });
            setIconFile(null);
            setNightIconFile(null);
            setIconPreview('');
            setNightIconPreview('');
        }
    }, [pkg, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleToggle = (name: keyof ProPackage) => {
        setFormData(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'day' | 'night') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (type === 'day') {
                setIconFile(file);
                setIconPreview(URL.createObjectURL(file));
            } else {
                setNightIconFile(file);
                setNightIconPreview(URL.createObjectURL(file));
            }
        }
    };

    const handleSubmit = async () => {
        const data = new FormData();
        // Append all fields
        Object.keys(formData).forEach(key => {
            if (key !== 'icon' && key !== 'nightIcon' && key !== '_id' && key !== 'id') {
                data.append(key, String(formData[key as keyof ProPackage]));
            }
        });

        if (iconFile) {
            data.append('icon', iconFile);
        }
        if (nightIconFile) {
            data.append('nightIcon', nightIconFile);
        }

        // For update, we might need ID, but passing FormData doesn't carry ID usually unless we clean api.
        // The parent will handle the ID in the URL.

        await onSave(data);
        onClose();
    };

    if (!isOpen) return null;

    const inputClass = `w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${isDarkMode
            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
        }`;

    const labelClass = `block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`;

    const ToggleItem = ({ label, field, checked }: { label: string, field: keyof ProPackage, checked: boolean }) => (
        <div className={`flex items-center justify-between p-3 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-100 bg-gray-50'
            }`}>
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{label}</span>
            <button
                onClick={() => handleToggle(field)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked
                        ? 'bg-green-500'
                        : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                    }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
                        }`}
                />
                {checked && (
                    <Check className="absolute left-1.5 h-3 w-3 text-white" />
                )}
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className={`w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'} my-8`}>
                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {isNew ? 'New Pro Package' : 'Edit Pro Package'}
                    </h2>
                    <button onClick={onClose} className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}>
                        <X className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-6">

                        {/* Status Toggle */}
                        <div className="flex items-center justify-between">
                            <span className={labelClass}>Status</span>
                            <button
                                onClick={() => setFormData(prev => ({ ...prev, status: prev.status === 'enabled' ? 'disabled' : 'enabled' }))}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.status === 'enabled'
                                        ? 'bg-green-500'
                                        : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.status === 'enabled' ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                                {formData.status === 'enabled' && (
                                    <Check className="absolute left-1.5 h-3 w-3 text-white" />
                                )}
                            </button>
                        </div>

                        {/* Name, Price, Color Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} placeholder="e.g. Star" />
                            </div>
                            <div>
                                <label className={labelClass}>Price</label>
                                <input type="number" name="price" value={formData.price} onChange={handleChange} className={inputClass} placeholder="0" />
                            </div>
                            <div>
                                <label className={labelClass}>Color</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" name="color" value={formData.color} onChange={handleChange} className="h-10 w-10 p-1 rounded bg-transparent border-0 cursor-pointer" />
                                    <input type="text" name="color" value={formData.color} onChange={handleChange} className={`${inputClass} flex-1`} />
                                </div>
                            </div>
                        </div>

                        {/* Feature Toggles Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ToggleItem label="Featured member" field="featured" checked={formData.featured} />
                            <ToggleItem label="See profile visitors" field="seeProfileVisitors" checked={formData.seeProfileVisitors} />
                            <ToggleItem label="Show / Hide last seen" field="showLastSeen" checked={formData.showLastSeen} />
                            <ToggleItem label="Verified badge" field="verifiedBadge" checked={formData.verifiedBadge} />
                        </div>

                        {/* Promotions & Limits */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Pages promotion</label>
                                <input type="number" name="pagesPromotion" value={formData.pagesPromotion} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Posts promotion</label>
                                <input type="number" name="postsPromotion" value={formData.postsPromotion} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Max Upload Size</label>
                                <select name="maxUploadSize" value={formData.maxUploadSize} onChange={handleChange} className={inputClass}>
                                    {['16 MB', '24 MB', '48 MB', '96 MB', '256 MB', '512 MB', '1 GB'].map(size => (
                                        <option key={size} value={size}>{size}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Discount (%)</label>
                                <input type="number" name="discount" value={formData.discount} onChange={handleChange} className={inputClass} />
                            </div>
                        </div>

                        {/* Duration */}
                        <div>
                            <label className={labelClass}>Paid Every</label>
                            <div className="flex gap-4">
                                <input type="number" name="duration" value={formData.duration} onChange={handleChange} className={`${inputClass} w-24`} />
                                <select name="durationUnit" value={formData.durationUnit} onChange={handleChange} className={`${inputClass} flex-1`}>
                                    <option value="Day">Day</option>
                                    <option value="Week">Week</option>
                                    <option value="Month">Month</option>
                                    <option value="Year">Year</option>
                                </select>
                            </div>
                        </div>

                        {/* Icons */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Icon</label>
                                <div className={`border-2 border-dashed rounded-lg p-4 text-center ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                                    {iconPreview ? (
                                        <div className="relative inline-block">
                                            <img src={iconPreview} alt="Icon Preview" className="h-16 w-16 object-contain" />
                                        </div>
                                    ) : (
                                        <div className="text-gray-400">
                                            <Upload className="mx-auto h-8 w-8 mb-2" />
                                            <span className="text-xs">Upload Icon</span>
                                        </div>
                                    )}
                                    <input type="file" onChange={(e) => handleIconChange(e, 'day')} className="mt-2 text-xs w-full" accept="image/*" />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Width=32px, Height=32px, .png</p>
                            </div>
                            <div>
                                <label className={labelClass}>Night Icon</label>
                                <div className={`border-2 border-dashed rounded-lg p-4 text-center ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                                    {nightIconPreview ? (
                                        <div className="relative inline-block">
                                            <img src={nightIconPreview} alt="Night Icon Preview" className="h-16 w-16 object-contain" />
                                        </div>
                                    ) : (
                                        <div className="text-gray-400">
                                            <Upload className="mx-auto h-8 w-8 mb-2" />
                                            <span className="text-xs">Upload Night Icon</span>
                                        </div>
                                    )}
                                    <input type="file" onChange={(e) => handleIconChange(e, 'night')} className="mt-2 text-xs w-full" accept="image/*" />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Width=32px, Height=32px, .png</p>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className={labelClass}>Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} className={`${inputClass} h-24`} placeholder="Get started!" />
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <div className={`px-6 py-4 border-t flex justify-end gap-3 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Close
                    </button>
                    <button
                        onClick={handleSubmit}
                        className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors bg-red-600 hover:bg-red-700 shadow-md`}
                    >
                        SAVE CHANGES
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditPackageModal;
