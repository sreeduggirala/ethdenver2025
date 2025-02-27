import Image from "next/image"

interface NFTCardProps {
  imageUrl: string
  username: string
  backgroundColor?: string
  isEmpty?: boolean
}

export default function NFTCard({
  imageUrl,
  username,
  backgroundColor = "bg-gray-800",
  isEmpty = false,
}: NFTCardProps) {
  return (
    <div className="flex flex-col items-center">
      {isEmpty ? (
        <div className="border-2 border-white rounded-md flex items-center justify-center mb-2 w-full aspect-square">
          <span className="text-xl font-mono transform -rotate-45">search</span>
        </div>
      ) : (
        <div className={`${backgroundColor} rounded-md overflow-hidden mb-2 w-full aspect-square`}>
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={username}
            width={200}
            height={200}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <span className="text-xl font-mono">{username}</span>
    </div>
  )
}

