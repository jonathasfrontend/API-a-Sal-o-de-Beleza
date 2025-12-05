# Implementação de Status de Pagamento em Agendamentos

## 📋 Resumo das Alterações

Esta implementação refatora o sistema de pagamentos para que:

1. **Criação Automática de Pagamento**: Ao criar um agendamento, um registro de pagamento é criado automaticamente com status `PENDING`
2. **Retorno de Status Detalhado**: O status do pagamento agora retorna valores específicos: `PENDING`, `PAID`, `PARTIAL`, `CANCELLED`, `REFUNDED`
3. **Sincronização de Status**: Quando um agendamento é cancelado, o pagamento associado também é cancelado automaticamente

## 🔄 Mudanças no Backend

### 1. Service de Appointments (`appointments.service.ts`)

#### Método `create()`
- Agora utiliza uma **transaction** do Prisma
- Cria o agendamento e o pagamento em uma única operação atômica
- O pagamento é criado com:
  - `status: 'PENDING'`
  - `method: 'CASH'` (padrão, pode ser alterado posteriormente)
  - `amount`: valor total do agendamento
  - Vínculo com o agendamento e cliente

```typescript
const appointment = await prisma.$transaction(async (tx) => {
  // Cria o agendamento
  const newAppointment = await tx.appointment.create({...});
  
  // Cria o pagamento automaticamente
  await tx.payment.create({
    data: {
      appointmentId: newAppointment.id,
      clientId: data.clientId,
      amount: totalAmount,
      method: 'CASH',
      status: 'PENDING',
    },
  });
  
  return tx.appointment.findUnique({
    where: { id: newAppointment.id },
    include: { payments: true },
  });
});
```

#### Método `findAll()`
- Agora inclui os **payments** relacionados
- Retorna apenas o pagamento mais recente (ordenado por data de criação)
- Permite ao frontend acessar o status do pagamento diretamente

#### Método `findById()`
- Já incluía payments (sem alterações necessárias)

#### Método `update()`
- Atualizado para incluir **payments** na resposta
- Garante consistência de dados em todas as operações

#### Método `cancel()`
- Utiliza **transaction** para garantir atomicidade
- Cancela o agendamento E o pagamento associado
- Atualiza apenas pagamentos com status `PENDING` ou `PARTIAL`

```typescript
const result = await prisma.$transaction(async (tx) => {
  // Atualiza status do agendamento
  const updatedAppointment = await tx.appointment.update({
    where: { id },
    data: { status: 'CANCELLED' },
    include: { payments: true },
  });

  // Cancela pagamentos pendentes/parciais
  await tx.payment.updateMany({
    where: {
      appointmentId: id,
      status: { in: ['PENDING', 'PARTIAL'] },
    },
    data: { status: 'CANCELLED' },
  });

  return updatedAppointment;
});
```

## 🎨 Mudanças no Frontend

### 1. Tipos (`types/index.ts`)

```typescript
export interface Appointment {
  // ... campos existentes
  payments?: Payment[];      // Array de pagamentos relacionados
  paymentStatus?: PaymentStatus; // Status do pagamento (calculado)
}
```

### 2. Utils (`lib/utils.ts`)

Criada nova função helper:

```typescript
/**
 * Get payment status from appointment
 * Returns the most recent payment status or 'PENDING' if no payment exists
 */
export function getAppointmentPaymentStatus(appointment: any): string {
  if (!appointment) return 'PENDING';
  
  // Se existe array de payments, retorna o status do mais recente
  if (appointment.payments && appointment.payments.length > 0) {
    return appointment.payments[0].status;
  }
  
  // Fallback para campo isPaid (compatibilidade)
  if (appointment.isPaid) {
    return 'PAID';
  }
  
  return 'PENDING';
}
```

## 📊 Status de Pagamento

### Valores Possíveis

| Status | Descrição | Quando é usado |
|--------|-----------|----------------|
| `PENDING` | Aguardando pagamento | Agendamento criado, pagamento ainda não realizado |
| `PAID` | Pago completamente | Pagamento confirmado e completo |
| `PARTIAL` | Pagamento parcial | Cliente pagou parte do valor |
| `CANCELLED` | Cancelado | Agendamento foi cancelado |
| `REFUNDED` | Reembolsado | Valor foi devolvido ao cliente |

### Labels em Português

A função `getStatusLabel()` já foi atualizada para incluir os labels:

```typescript
PENDING: 'Pendente',
PAID: 'Pago',
PARTIAL: 'Parcial',
CANCELLED: 'Cancelado',
REFUNDED: 'Reembolsado',
```

## 🎯 Uso no Frontend

### Exemplo de Exibição de Status

```tsx
import { getAppointmentPaymentStatus, getStatusLabel, getStatusColor } from '@/lib/utils';

function AppointmentCard({ appointment }) {
  const paymentStatus = getAppointmentPaymentStatus(appointment);
  
  return (
    <div>
      <span className={getStatusColor(paymentStatus)}>
        {getStatusLabel(paymentStatus)}
      </span>
    </div>
  );
}
```

### Exemplo de Verificação

```tsx
const paymentStatus = getAppointmentPaymentStatus(appointment);

if (paymentStatus === 'PENDING') {
  // Mostrar botão de pagamento
}

if (paymentStatus === 'PAID') {
  // Mostrar comprovante
}
```

## 🔐 Fluxo de Dados

### 1. Criação de Agendamento

```
Cliente/Staff cria agendamento
    ↓
Backend cria Appointment + Payment (PENDING)
    ↓
Frontend recebe appointment.payments[0].status = 'PENDING'
    ↓
UI exibe: "Pagamento Pendente"
```

### 2. Processamento de Pagamento

```
Staff registra pagamento
    ↓
Backend atualiza Payment.status para 'PAID'
    ↓
Frontend recebe appointment.payments[0].status = 'PAID'
    ↓
UI exibe: "Pago"
```

### 3. Cancelamento

```
Cliente/Staff cancela agendamento
    ↓
Backend atualiza Appointment.status + Payment.status
    ↓
Frontend recebe appointment.payments[0].status = 'CANCELLED'
    ↓
UI exibe: "Cancelado"
```

## ⚠️ Considerações Importantes

1. **Transações**: Todas as operações que envolvem agendamento e pagamento usam transactions do Prisma para garantir consistência

2. **Retrocompatibilidade**: O campo `isPaid` ainda existe no schema, mas não é mais o principal indicador. Use `getAppointmentPaymentStatus()` para compatibilidade

3. **Pagamento Padrão**: Por padrão, o método de pagamento é `CASH`. Isso pode ser alterado posteriormente através da API de pagamentos

4. **Array de Payments**: Sempre pegue o primeiro item (`payments[0]`) pois está ordenado por data de criação descendente

5. **Validação**: Sempre verifique se o array de payments existe antes de acessar

## 🚀 Próximos Passos

- [ ] Implementar endpoint para atualizar método de pagamento
- [ ] Criar tela de gerenciamento de pagamentos
- [ ] Implementar pagamento parcial
- [ ] Integração com gateway de pagamento
- [ ] Relatório de pagamentos pendentes
- [ ] Notificações de pagamento

## 📝 Exemplos de API

### Criar Agendamento (Resposta)

```json
{
  "status": "success",
  "data": {
    "appointment": {
      "id": "uuid",
      "clientId": "uuid",
      "staffId": "uuid",
      "startTime": "2024-12-03T10:00:00Z",
      "status": "SCHEDULED",
      "totalAmount": 150.00,
      "payments": [
        {
          "id": "uuid",
          "appointmentId": "uuid",
          "amount": 150.00,
          "method": "CASH",
          "status": "PENDING",
          "createdAt": "2024-12-03T09:00:00Z"
        }
      ]
    }
  }
}
```

### Listar Agendamentos (Resposta)

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "status": "SCHEDULED",
      "totalAmount": 150.00,
      "payments": [
        {
          "status": "PENDING"
        }
      ]
    }
  ]
}
```

---

**Data da Implementação**: 03/12/2024  
**Autor**: GitHub Copilot  
**Versão**: 1.0
