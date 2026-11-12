const PORT = process.env.PORT || 3000;

function resolveImageUrl(localImagePath, req = null) {
    const host = req ? `${req.protocol}://${req.get('host')}` : `http://localhost:${PORT}`;

    if (localImagePath && (localImagePath.startsWith('/images/') || localImagePath.startsWith('/uploads/') || localImagePath.startsWith('http'))) {
        if (localImagePath.startsWith('http')) return localImagePath;
        return `${host}${localImagePath}`;
    }
    
    if (localImagePath && localImagePath.startsWith('PLACEHOLDER:')) {
        const parts = localImagePath.split(':');
        const emoji = encodeURIComponent(parts[1]);
        const label = encodeURIComponent(parts[2]);
        const color = encodeURIComponent(parts[3] || '#8b5cf6');
        return `${host}/placeholder/${emoji}/${label}/${color}`;
    }
    
    // fallback to a generic placeholder
    return `${host}/placeholder/${encodeURIComponent('📱')}/${encodeURIComponent('Device')}/${encodeURIComponent('#8b5cf6')}`;
}

module.exports = {
    resolveImageUrl
};

