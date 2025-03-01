import Image from "next/image"

interface NFTCardProps {
  imageUrl: string
  username: string
  backgroundColor?: string
  isEmpty?: boolean
  price?: string
  points?: number
}

export default function NFTCard({
  imageUrl,
  username,
  backgroundColor = "bg-gray-800",
  isEmpty = false,
  price,
  points,
}: NFTCardProps) {
  if (isEmpty) {
    return (
      <div className="aspect-square rounded-lg border-2 border-dashed border-gray-700 flex flex-col items-center justify-center hover:border-purple-500 hover:bg-gray-900 transition-all duration-200">
        <span className="text-gray-500">Empty Slot</span>
        <span className="text-sm text-gray-400 mt-2">Click to add KOL</span>
      </div>
    )
  }

  return (
    <div className={`
      aspect-square 
      rounded-lg 
      overflow-hidden 
      ${backgroundColor || 'bg-gray-800'}
      transform transition-all duration-200
      hover:scale-105
      hover:shadow-xl
      hover:shadow-purple-500/20
      hover:z-10
      relative
    `}>
      <div className="relative h-full">
        <Image
          src={imageUrl}
          alt={username}
          fill
          className="object-cover"
        />
        <div 
          className="absolute bottom-0 left-0 right-0 h-16"
          style={{ backgroundImage: 'linear-gradient(to top, white 80%, transparent 100%)' }}
        >
          <div className="absolute bottom-0 p-3 w-full">
          <div className="flex justify-between text-base font-semibold">
              <span className="font-bold text-xl mb-0 text-black">{username}</span>
              <div className="text-green-600 font-bold text-xl">{price}c</div>
              <span className="text-yellow-600 font-bold text-xl">{points} pts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
  
  
}

