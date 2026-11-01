export function formatMessagePreview(content: string) {
    if (!content) return "";
    
    // Check for Voice Notes
    if (content.startsWith("🎤 ")) {
        return "🎤 Voice message";
    }
    
    // Check for generic file/image URLs
    if (content.match(/https?:\/\/.*\.(jpeg|jpg|gif|png|webp|pdf|doc|docx|webm|mp4|m4a)/i)) {
        if (content.match(/\.(jpeg|jpg|gif|png|webp)/i)) return "📷 Photo";
        if (content.match(/\.(webm|mp4|m4a)/i)) return "🎤 Voice note / Audio";
        return "📄 Document";
    }
    
    return content;
}