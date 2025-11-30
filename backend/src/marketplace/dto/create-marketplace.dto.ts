export class CreateMarketplaceDto {
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string; // URL de l'image (optionnel)
  user: {
    id: string;
  };
}
