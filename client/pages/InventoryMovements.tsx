import React, { useEffect, useState } from 'react';
import { InventoryMovementService } from '@/api/services/inventoryMovementService';
import { InventoryMovement } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, ArrowUpCircle, ArrowDownCircle, Package, RefreshCw } from 'lucide-react';

