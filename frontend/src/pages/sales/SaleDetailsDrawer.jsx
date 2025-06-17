import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { FileText, CreditCard, Calendar, Users, User } from 'lucide-react';

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    value || 0
  );
const formatDate = (dateString) =>
  dateString ? new Date(dateString).toLocaleDateString('pt-BR') : '-';

const SaleDetailsDrawer = ({ open, onOpenChange, sale, customers = [] }) => {
  if (!sale) return null;
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="w-full sm:max-w-lg p-0">
        <DrawerHeader className="border-b px-6 py-4">
          <DrawerTitle>Detalhes da Venda</DrawerTitle>
        </DrawerHeader>
        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4" /> Venda {sale.sale_number}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="font-semibold">Cliente Responsável:</span>{' '}
                {sale.customer?.first_name} {sale.customer?.last_name}
              </div>
              {sale.seller && (
                <div>
                  <span className="font-semibold">Vendedor:</span>{' '}
                  {sale.seller.first_name} {sale.seller.last_name}
                </div>
              )}
              {sale.trip && (
                <div>
                  <span className="font-semibold">Passeio:</span> {sale.trip.title}
                </div>
              )}
              {sale.vehicle && (
                <div>
                  <span className="font-semibold">Veículo:</span>{' '}
                  {sale.vehicle.plate} - {sale.vehicle.model}
                </div>
              )}
              {sale.driver && (
                <div>
                  <span className="font-semibold">Motorista:</span>{' '}
                  {sale.driver.first_name} {sale.driver.last_name}
                </div>
              )}
              {sale.description && (
                <div>
                  <span className="font-semibold">Descrição:</span>{' '}
                  {sale.description}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Valores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="font-semibold">Subtotal:</span>{' '}
                {formatCurrency(sale.subtotal)}
              </div>
              <div>
                <span className="font-semibold">Desconto:</span>{' '}
                {sale.discount_percentage ? `${sale.discount_percentage}% ` : ''}
                {formatCurrency(sale.discount_amount)}
              </div>
              <div>
                <span className="font-semibold">Impostos:</span>{' '}
                {formatCurrency(sale.tax_amount)}
              </div>
              <div>
                <span className="font-semibold">Total:</span>{' '}
                {formatCurrency(sale.total_amount)}
              </div>
              {sale.commission_percentage && (
                <div>
                  <span className="font-semibold">Comissão:</span>{' '}
                  {sale.commission_percentage}% (
                  {formatCurrency(sale.commission_amount)})
                </div>
              )}
              {sale.payment_method && (
                <div>
                  <span className="font-semibold">Método de Pagamento:</span>{' '}
                  {sale.payment_method}
                </div>
              )}
              <div>
                <span className="font-semibold">Status do Pagamento:</span>{' '}
                {sale.payment_status}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Datas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="font-semibold">Data da Venda:</span>{' '}
                {formatDate(sale.sale_date)}
              </div>
              <div>
                <span className="font-semibold">Vencimento:</span>{' '}
                {formatDate(sale.due_date)}
              </div>
              <div>
                <span className="font-semibold">Data do Pagamento:</span>{' '}
                {formatDate(sale.payment_date)}
              </div>
              <div>
                <span className="font-semibold">Data de Entrega:</span>{' '}
                {formatDate(sale.delivery_date)}
              </div>
            </CardContent>
          </Card>

          {customers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-4 h-4" /> Participantes ({customers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {customers.map((sc) => (
                  <div key={sc.id} className="flex items-center gap-2">
                    <User className="w-4 h-4 text-zapchat-primary" />
                    <span>
                      {sc.customer.first_name} {sc.customer.last_name}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {sale.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">{sale.notes}</CardContent>
            </Card>
          )}

          {sale.internal_notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notas Internas</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">{sale.internal_notes}</CardContent>
            </Card>
          )}
        </div>
        <DrawerFooter className="border-t px-6 py-4">
          <DrawerClose className="px-4 py-2 bg-zapchat-primary text-white rounded-md hover:bg-zapchat-medium">
            Fechar
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default SaleDetailsDrawer;
