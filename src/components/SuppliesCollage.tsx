import { SupplyThumbnail } from './SupplyThumbnail'
import type { Supply } from '../domain/supplies/supply.types'

export function SuppliesCollage({ supplies }: { supplies: Supply[] }) {
  if (supplies.length === 0) {
    return <p className="supplies-collage__empty">No supplies assigned yet.</p>
  }

  return (
    <div className="supplies-collage">
      {supplies.map((supply) => (
        <div key={supply.id} className="supplies-collage__item">
          <SupplyThumbnail supplyId={supply.id} supplyName={supply.name} />
          <span className="supplies-collage__name">{supply.name}</span>
        </div>
      ))}
    </div>
  )
}
