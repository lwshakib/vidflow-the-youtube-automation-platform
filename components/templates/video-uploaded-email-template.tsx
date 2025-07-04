interface EmailTemplateProps {
  name: string;
  videoUrl: string;
  channelName: string;
  videoTitle: string;
  videoDescription: string;
  videoTags: string[];
  videoThumbnail: {
    url: string;
    width: number;
    height: number;
  };
}

export function EmailTemplate({
  name,
  videoUrl,
  channelName,
  videoTitle,
  videoDescription,
  videoTags,
  videoThumbnail,
}: EmailTemplateProps) {
  return (
    <div className="font-sans bg-gray-50 p-8 rounded-xl max-w-xl mx-auto text-gray-900">
      <h1 className="text-2xl font-bold text-blue-600 mb-2 flex items-center gap-2">
        🎉 Video Uploaded Successfully!
      </h1>
      <p className="mb-2">
        Hi <span className="font-semibold">{name}</span>,
      </p>
      <p className="mb-4">
        Your video has been uploaded to YouTube! Here are the details:
      </p>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block mb-4"
        >
          <img
            src={videoThumbnail.url}
            alt="Video Thumbnail"
            className="w-full max-w-xs rounded-md mx-auto mb-2"
          />
        </a>
        <h2 className="text-lg font-semibold mb-1">{videoTitle}</h2>
        <p className="text-sm text-gray-500 mb-2">
          by <span className="font-medium">{channelName}</span>
        </p>
        <p className="mb-3 text-gray-700 whitespace-pre-line">
          {videoDescription}
        </p>
        <div className="mb-3">
          <span className="font-medium">Tags:</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {videoTags && videoTags.length > 0 ? (
              videoTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-block bg-blue-100 text-blue-700 rounded px-2 py-0.5 text-xs"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-xs">No tags</span>
            )}
          </div>
        </div>
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 px-5 py-2 bg-blue-600 text-white rounded font-semibold text-sm shadow hover:bg-blue-700 transition-colors"
        >
          Watch on YouTube
        </a>
      </div>
      <p className="text-gray-500 text-xs">Thank you for using VidFlow! 🚀</p>
    </div>
  );
}
